/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) { 
    const pList = imports["sn_access_analyzer.PresentationListController"](api, helpers);
    const comparator = new imports["sn_access_analyzer.AccessComparator"](api, helpers);
    const {
        navigate,
        navTo
    } = imports["sn_access_analyzer.UserComparisonUtil"](api, helpers);
    const {
        updateState,
        updateArrayState,
        emitActionPerformed
    } = new imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);

    const IS_SINGLE_OPERATION_SCREEN = api.state.breadCrumbs.length == 2;
    const translatedMessages = api.state.translatedMessages;

    const onScreenLoad = ({
        forward,
        label,
        name
    }) => {
        const data = _getData(name);
        if (data.length > 0) {
            emitActionPerformed('UPDATE_LIST', {
                index: 1,
                data
            });
            _updateBreadCrumbs(label, forward);
            updateState('tableDef', 'showPagination', true);
        } else {
            helpers.modal.open("no_acl_modal", {
                bare: true
            });
        }
    };

    const listCellLinkClicked = () => {
        if (!IS_SINGLE_OPERATION_SCREEN) {
            return;
        }
        var value = event.payload.cell.metadata;
        if (value.type == 'Access Handler') {
            helpers.modal.open('ah_modal', {
                bare: true
            });
            return;
        }

        if (value.type == 'Business Rule') {
            navigate({
                external: navTo('sys_script', value.id)
            });
            return;
        }

        if (value.type == 'Data Filtration') {
            navigate({
                external: navTo('sys_df_data_filtration', value.id)
            });
            return;
        }

        if (value.type == 'Security Data Filter') {
            navigate({
                external: navTo('sys_security_data_filter', value.baseUser.acl.recordRef)
            });
            return;
        }

        updateState('tableDef', 'showPagination', false);

        emitActionPerformed('LOAD_ACL_DETAIL', {
            label: event.payload.cell.label,
            metadata: value,
            forward: true
        });
    };

    const breadCrumbItemClicked = () => {
        if (!IS_SINGLE_OPERATION_SCREEN) {
            return;
        }
        updateState('tableDef', 'showPagination', false);
        emitActionPerformed('LOAD_ALL_OPERATION', {
            forward: false
        });
    };

    const paginate = () => {
        pList.getController("tableDef").handlePagination(event);
    };

    const _updateBreadCrumbs = (label, forward) => {
        if (forward)
            helpers.translate('{0} operation', label.charAt(0).toUpperCase() + label.slice(1)).then(value => {
                updateArrayState('breadCrumbs', {
                    label: value,
                    name: label,
                    stage: l + 1,
                    icon: 'keys-outline',
                    href: 'javascript:void(0);'
                });
            });
        else
            api.setState('breadCrumbs', api.state.breadCrumbs.slice(0, 2));
    };

    const _getData = (operationName) => {
        const logs = [];
        _prepareSingleOperation(logs, 'present_status', api.state.masterData.accessResults.securityDebug[operationName]?.debugLogs);
        _prepareSingleOperation(logs, 'simulated_status', api.state.masterData.simulatedResults.securityDebug[operationName]?.debugLogs);
        return comparator.getComparator("simulated_results_debug_logs", 'present_status', 'simulated_status').getComparisonResult(logs);
    };

    const _prepareSingleOperation = (logs, category, debugLogs) => {
        debugLogs?.forEach(dL => {
            if (dL.logType == 'SecurityRulesInfo') {
                dL.acls?.forEach(acl => {
                    logs.push({
                        ...acl,
                        decisionType: translatedMessages[acl.aclDecisionType] || "",
                        appliesToConditionResult: translatedMessages[acl.appliesToConditionResult] || "",
                        empty: translatedMessages[acl.empty] || translatedMessages['false'],
                        category
                    });
                });
                return;
            }

            var rowObj = {
                ...dL,
                category
            };

            if (dL.logType === 'SecurityDataFilterInfo') {
                rowObj.decisionType = dL.dataFilterResult.mode == 'IF' ? 'Filter If' : 'Filter Unless';
            }

            logs.push(rowObj);

        });
    };

    const handleEvent = ({
        eventName,
        eventPayload
    } = event.payload) => {
        if (eventName == 'LOAD_SINGLE_OPERATION') {
            onScreenLoad(eventPayload);
        }
    };
    let fnMap = {
        list: listCellLinkClicked,
        breadcrumbs: breadCrumbItemClicked,
        list_pagination: paginate,
        ah_got_it_btn: () => helpers.modal.close("ah_modal"),
        close_no_acl_modal: () => helpers.modal.close("noAclModal"),
        SIMULATOR_ACTION_PERFORMED: handleEvent
    };
    let fn = fnMap[event.elementId] || fnMap[event.name];
    if (fn) {
        fn();
    }
}
