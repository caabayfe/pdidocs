/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var serviceDeskUtils = imports['sn_sow_inc.SowIncidentLandingPageUtils']();
    var sowUtils = imports['sn_sow.SowUtils']();
    var nameValueMap = sowUtils.getNameValueMap(event.payload.params.query);
    var currentVizSelection = {};
    var previousVizSelection = {};
    var value = event.context.item.value;
    var payload = event.payload;
    var querySegments = payload.params.querySegments || [];
    currentVizSelection.table = value.datasource[0].tableOrViewName;
    currentVizSelection.query = payload.params.query + value.updated_on;
    currentVizSelection.elementId = value.id;
    currentVizSelection.recordCount = payload.data.value;
    currentVizSelection.listView = value.listView;
    currentVizSelection.groupByField = value.groupBy[0].groupBy[0].groupByField;
    currentVizSelection.querySegments = querySegments;
    if (currentVizSelection.table == 'task_sla')
        currentVizSelection.title = await serviceDeskUtils.fetchTitleForSLA(payload.params.query, api.state.reportRanges, helpers, querySegments);
    else {
        currentVizSelection.title = await serviceDeskUtils.fetchTitle(currentVizSelection.table, nameValueMap[currentVizSelection.groupByField], currentVizSelection.groupByField, api.state.groupMode);
        const translations = api.state.translations;
        if (translations.hasOwnProperty(currentVizSelection.title))
            currentVizSelection.title = translations[currentVizSelection.title];
    }
    
    if(querySegments && querySegments.length > 0) {
        previousVizSelection = { ...currentVizSelection};
        previousVizSelection.groupBy = payload.data.groupBy[0];
        previousVizSelection.rawQuery = payload.params.query;
    }
    else {
        previousVizSelection.elementId = value.id;
    }

    api.setState('currentVizSelection', currentVizSelection);
    api.setState('previousVizSelection', previousVizSelection);
    api.setState('listRefreshRequested', {
        timestamp: new Date().getTime()
    });
    api.setState('hideList', false);
}
