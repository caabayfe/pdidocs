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
    const subPageHandler = imports["sn_access_analyzer.GuidedExperienceSubPageHandler"](api);
    const pList = imports["sn_access_analyzer.PresentationListController"](api, helpers);
    const simUtil = new imports["sn_access_analyzer.AccessSimulatorUtil"](api, helpers);
    const SubPageEvent = subPageHandler.SubPageEvent;
    let gvar = api.state.gvar;

    const onPageReady = (payload) => {
        const dataSet = payload.dataSet;
        api.state.masterData.simulatedResults = dataSet.criteria.simulatedResult;
        /**
         * Check if data available in cache
         */
        if (dataSet.result.accessResults) {
            api.state.masterData.accessResults = dataSet.result.accessResults;
            simUtil.emitActionPerformed('LOAD_ALL_OPERATION');
            return;
        }
        gvar.req = dataSet.criteria.request;
        getDebugLog();
    };

    const updateList = ({
        data,
        index
    }) => {
        simUtil.updateState('tableDef', 'loading', true);
        api.state.tableDef.colDef = api.state.tableDefs[index].colDef;
        api.state.tableDef.rowDef = api.state.tableDefs[index].rowDef;
        api.state.tableDef.pagination = api.state.tableDefs[index].pagination;
        pList.getController('tableDef').update(data);
        simUtil.updateState('tableDef', 'loading', false);
        subPageHandler.hideLoader();
    };

    const getDebugLog = (refresh) => {
        if(refresh)
            subPageHandler.showLoader();
        let req = gvar.req;
        simUtil.getDebugLog(
            "access_simulator_data_broker",
            req.user.id,
            req.table.sublabel,
            req.record.id,
            req.field.id);
    };

    subPageHandler.onReceive(SubPageEvent.PAGE_READY, onPageReady);
    subPageHandler.handle(event);

    const simActionPerformedHandler = ({
        eventName,
        eventPayload
    } = event.payload) => {
        if (eventName == 'UPDATE_LIST') {
            updateList(eventPayload);
        }
    };

    simUtil.execute({
        SIMULATOR_ACTION_PERFORMED: simActionPerformedHandler,
        emptyState: () => getDebugLog(true)
    }, event);
}
