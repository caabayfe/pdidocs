

/**
 * An event handler on page load and on property change.
 */
function handler({
    api,
    event,
    imports
}) {
    const {
        syncHiddenEdges
    } = imports['sn_app_ux_commons.nodeMapExpandedGroups']();

    const {
        nodes,
        hiddenNodeIds
    } = api.context.props;
    const {executeNow} = api.state;

    const _setReduceMotion = () => {
        const {
            preferences
        } = api.context.session.user;
        const reduceMotionPref = preferences.find(pref => pref.name === 'glide.polaris.animation_disabled') || {};
        const {
            value
        } = reduceMotionPref;
        api.setState('reduceMotion', value === 'true');
    };

    const _onHiddenChanged = (hiddenNodeIds, hiddenEdgeIds, lastRequestedSelectionId, ctx) => {
        if (!ctx)
            return; // early invocation, skip and wait for the first nodes data.

        const newHiddenEdgeIds = syncHiddenEdges(hiddenNodeIds, hiddenEdgeIds, ctx);
        api.setState('hiddenEdgeIds', newHiddenEdgeIds);

        api.emit('SN_NODE_MAP_UNIFIED_CTRL#CREATE_FIND_INDICES_REQUESTED', {});
    }

    const _onPropertyChange = () => {
        const {
            name,
            value
        } = event.payload;
        const {
            ctx,
            lastRequestedSelectionId
        } = api.state;

        switch (name) {
            case 'nodes':
            case 'edges':
                if (executeNow)
                    api.setState('executeNow', false); // reset execute now operation and avoid unnecessary call to map data change
                else
                    api.emit('SN_NODE_MAP_UNIFIED_CTRL#MAP_DATA_CHANGED', {});
                break;
            case 'homeNodeId':
                const homePayload = {
                    node: {
                        id: value
                    }
                };
                api.emit('SN_NODE_MAP_UNIFIED_CTRL#HOME_NODE_REQUESTED', homePayload);
                break;
            case 'hiddenEdgeIds':
                _onHiddenChanged(api.state.hiddenNodeIds, value, lastRequestedSelectionId, ctx);
                break;
            case 'hiddenNodeIds':
                api.setState('hiddenNodeIds', value);
                _onHiddenChanged(value, api.state.hiddenEdgeIds, lastRequestedSelectionId, ctx);
                break;
            case 'showError':
                api.emit('SN_NODE_MAP_UNIFIED_CTRL#ERROR_STATE_CHANGED', {});
                break;
            default:
                break;
        }
    };

    const _onPageLoad = () => {
        _setReduceMotion();
        api.emit('SN_NODE_MAP_UNIFIED_CTRL#MAP_DATA_CHANGED', {});
    };

    const {
        name: eventName
    } = event;

    if (eventName === 'MACROPONENT_PROPERTY_CHANGED')
        _onPropertyChange();
    else if (eventName === 'MACROPONENT_READY')
        _onPageLoad();
}
