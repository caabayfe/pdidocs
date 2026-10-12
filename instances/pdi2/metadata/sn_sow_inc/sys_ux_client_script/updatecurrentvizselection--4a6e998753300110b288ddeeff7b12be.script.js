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
    var currentVizSelection = {};
    var previousVizSelection = api.state.previousVizSelection;
    const conditionalRecordCount = api.state.conditionalRecordCount;
    var teamsMode = false;
    var serviceDeskUtils = imports['sn_sow_inc.SowIncidentLandingPageUtils']();
    var sowUtils = imports['sn_sow.SowUtils']();
    if (event.payload) {
        teamsMode = (event.payload.value[0] === "your_team_work");
    }
    if (!previousVizSelection.elementId || (teamsMode && previousVizSelection.elementId === 'delegated_task')) {
        currentVizSelection = await serviceDeskUtils.getVisualisationCardConfig("incident_assigned", helpers, event.payload.value[0], conditionalRecordCount);
        api.setState("previousVizSelection", {});
    } else {
        if (!previousVizSelection.query)
            currentVizSelection = await serviceDeskUtils.getVisualisationCardConfig(previousVizSelection.elementId, helpers, event.payload.value[0], conditionalRecordCount);
        else {
            var nameValueMap = sowUtils.getNameValueMap(previousVizSelection.query);
            previousVizSelection.query = await serviceDeskUtils.getVisualisationCardQuery(previousVizSelection, nameValueMap, helpers, event.payload.value[0], conditionalRecordCount);
            currentVizSelection = { ...previousVizSelection
            };
            if (currentVizSelection.table == 'task_sla')
                currentVizSelection.title = await serviceDeskUtils.fetchTitleForSLA(previousVizSelection.rawQuery, api.state.reportRanges, helpers, previousVizSelection.querySegments);
            else currentVizSelection.title = await serviceDeskUtils.fetchTitle(currentVizSelection.table, nameValueMap[previousVizSelection.groupByField], previousVizSelection.groupByField, teamsMode);
        }
    }
    const translations = api.state.translations;
    if (translations.hasOwnProperty(currentVizSelection.title))
        currentVizSelection.title = translations[currentVizSelection.title];
    api.setState('groupMode', teamsMode);
    api.setState("currentVizSelection", currentVizSelection);

    var jsonObj = [];
    if (api.state.parFilters.length == 0) {
        jsonObj.push({
            "order": 100,
            "type": "boolean",
            "apply_to": ["incident.active"],
            "values": ["true"]
        });
    }
    api.setState('parFilters', () => jsonObj);
    api.setState('listRefreshRequested', {
        timestamp: new Date().getTime()
    });
}
