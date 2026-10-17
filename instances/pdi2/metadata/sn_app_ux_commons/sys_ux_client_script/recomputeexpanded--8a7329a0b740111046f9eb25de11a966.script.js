
/**
 * Event handler for SN_NODE_MAP_UNIFIED_CTRL#RECOMPUTE_EXPANDED.
 * Recomputes expanded group nodes.
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        syncExpandedNodes,
        syncHiddenEdges
    } = imports['sn_app_ux_commons.nodeMapExpandedGroups']();

    const {
        nodes,
        edges,
        hiddenEdgeIds,
        hiddenNodeIds,
        homeNodeId
    } = api.context.props;

    const {
        mapData: {
            expandedGroupNodeIds = []
        },
        needCollapseAll,
        ctx
    } = api.state;

    const {
        groupId,
        source
    } = event.payload || {};

    let newExpandedIds;
    let newMapDataReceived = false;
    let fitToScreenRequired = false;
    let alignToNodeId = '';


    const action = needCollapseAll ? 'COLLAPSE_ALL' : source;
    api.setState('needCollapseAll', false);

    switch (action) {
        case 'EXPAND':
            newExpandedIds = [...expandedGroupNodeIds, groupId];
            break;
        case 'COLLAPSE':
            newExpandedIds = expandedGroupNodeIds.filter(id => id !== groupId);
            break;
        case 'COLLAPSE_ALL':
            newExpandedIds = [];
            fitToScreenRequired =  homeNodeId ? false: true;
            alignToNodeId = homeNodeId ? homeNodeId: '';
            newMapDataReceived = true;
            break;
        default:
            //no change in expanded groups
            newExpandedIds = expandedGroupNodeIds;
            newMapDataReceived = true;
            break;
    }

    const context = newMapDataReceived ?
        null : //data change, drop the ctx cache
        ctx;

    const i18n = {
        'Translated edge {label}': await helpers.translate('Translated edge {label}', {
            label: '$LABEL'
        }),
        'Aggregation of {count} edges': await helpers.translate('Aggregation of {count} edges', {
            count: '$COUNT'
        })
    };

    if (!nodes)
        return;

    const {
        ctx: newContext,
        visibleNodes,
        visibleEdges,
        errorCode,
        ...moreResult
    } = syncExpandedNodes(nodes, (edges || []), newExpandedIds, context, i18n);

    //set or clear error state
    api.emit('SN_NODE_MAP_UNIFIED_CTRL#ERROR_STATE_CHANGED', {
        //raise the flag only for errors, not warnings
        hasError: Boolean(errorCode) && errorCode.startsWith('ERR_')
    });

    if (errorCode) {
        api.emit('SN_NODE_MAP_UNIFIED_CTRL#ERROR_OCCURRED', {
            errorCode,
            details: moreResult
        });
        return;
    }

    api.setState('hiddenNodeIds', hiddenNodeIds);

    const outHiddenEdgeIds = syncHiddenEdges(hiddenNodeIds, hiddenEdgeIds, newContext);
    api.setState('hiddenEdgeIds', outHiddenEdgeIds);

    const {
        token = 0
    } = api.state.mapData;

    //refresh the node-map
    api.setState('mapData', {
        nodes: visibleNodes,
        edges: visibleEdges,
        expandedGroupNodeIds: newExpandedIds,
        //forcing state/prop update (rotating token)
        token: (token + 1) % Number.MAX_SAFE_INTEGER
    });

    //save the `ctx` cache for next expand/collapse request.
    //this also holds `edgesIndex` for reuse in the programmatic selection flow.
    api.setState('ctx', newContext);
    api.setState('fitToScreen', fitToScreenRequired);
    api.setState('alignToNodeId', alignToNodeId);

    const {
        lastRequestedSelectionId
    } = api.state;
    if (newMapDataReceived && lastRequestedSelectionId) {
        //if map data changed (not expand/collapse), and there's a selected element,
        //then trigger selection again to recompute for the merged edges
        api.emit('SN_NODE_MAP_UNIFIED_CTRL#SELECT_ELEMENT', {
            elementId: lastRequestedSelectionId
        });
    }

    //Now when the ctx is updated we can build the indices
    api.emit('SN_NODE_MAP_UNIFIED_CTRL#CREATE_FIND_INDICES_REQUESTED', {});

    const {find = {}} = api.state.findData || {};
    //if there's already a search term, reapply it on new/updated data
    if (find.term) {
        api.setState('findIndices', ({
            currentValue: findIndices,
            api
        }) => {
            //wait for `findIndices` to update on state
            api.emit('SN_NODE_MAP_UNIFIED_CTRL#APPLY_FIND', find);
            return findIndices; //making no change in state, only using the callback
        });
    }
}
