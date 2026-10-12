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
    const comparator = new imports["sn_access_analyzer.AccessComparator"](api, helpers);
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);
    const simUtil = new imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const IS_ALL_OPERATION_SCREEN = api.state.breadCrumbs.length == 1;

    const onScreenLoad = () => {
        simUtil.emitActionPerformed('UPDATE_LIST', {
            index: 0,
            data: _getData()
        });
        api.setState('breadCrumbs', api.state.breadCrumbs.slice(0, 1));
    };

    const listCellLinkClicked = (label = event.payload.cell.label) => {
        if (!IS_ALL_OPERATION_SCREEN) {
            return;
        }
        simUtil.emitActionPerformed('LOAD_SINGLE_OPERATION', {
            label,
            name: label,
            forward: true
        });
    };

    const onAccessSimulatorDataBrokerSuccess = () => {
        subPageHandler.hideLoader();
        simUtil.updateState('tableDef', 'loading', false);
        let error = simUtil.hasServerError(event);
        simUtil.updateComponentProps("hasServerError", error);
        if (error)
            return;
        api.state.masterData.accessResults = event.payload.data.output.result;
        subPageHandler.storeData("accessResults", event.payload.data.output.result);
        onScreenLoad();
    };

    const _getData = () => {
        const allOperations = [];
        _prepareAllOperations(allOperations, 'present_status', api.state.masterData.accessResults.securityDebug);
        _prepareAllOperations(allOperations, 'simulated_status', api.state.masterData.simulatedResults.securityDebug);
        return comparator.getComparator("simulated_results_all_operation", 'present_status', 'simulated_status').getComparisonResult(allOperations);
    };
    const _prepareAllOperations = (allOperations, type, securityDebug) => {
        for (let operationName in securityDebug) {
            const {
                overallAccess,
                containsScriptedACL
            } = securityDebug[operationName];
            allOperations.push({
                name: operationName,
                status: overallAccess,
                containsScriptedACL,
                category: type
            });
        }
    };

    const simActionPerformedHandler = ({
        eventName,
        eventPayload
    } = event.payload) => {
        switch (eventName) {
            case 'LOAD_ALL_OPERATION':
                onScreenLoad();
                break;
        }
    };

    simUtil.execute({
        list: listCellLinkClicked,
        access_simulator_data_broker: onAccessSimulatorDataBrokerSuccess,
        SIMULATOR_ACTION_PERFORMED: simActionPerformedHandler
    }, event);

}
