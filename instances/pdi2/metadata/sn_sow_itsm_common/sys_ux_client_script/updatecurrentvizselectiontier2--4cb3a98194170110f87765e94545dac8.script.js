/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    var currentVizSelection = {};
    var previousVizSelection = api.state.previousVizSelection;
    const conditionalRecordCount = api.state.conditionalRecordCount;
    var teamsMode = false;
    var serviceDeskUtils = imports['sn_sow_itsm_common.SOWLandingPageTier2Utils']();
    var sowUtils = imports['sn_sow.SowUtils']();

    if(event.payload){
        teamsMode = (event.payload.value[0] === "your_team_work");
    }
    if(!previousVizSelection.elementId || (teamsMode && previousVizSelection.elementId === 'delegated_task')){
        currentVizSelection = await serviceDeskUtils.getVisualisationCardConfig("incidentAssigned", helpers, event.payload.value[0], conditionalRecordCount);
        api.setState("previousVizSelection", {});
    } else {
        if(!previousVizSelection.query)
            currentVizSelection = await serviceDeskUtils.getVisualisationCardConfig(previousVizSelection.elementId, helpers, event.payload.value[0], conditionalRecordCount);
        else {
            var nameValueMap = sowUtils.getNameValueMap(previousVizSelection.query);
            previousVizSelection.query = await serviceDeskUtils.getVisualisationCardQuery(previousVizSelection, nameValueMap, helpers, event.payload.value[0], conditionalRecordCount);
            currentVizSelection = {...previousVizSelection};
            currentVizSelection.title = await serviceDeskUtils.fetchTitle(currentVizSelection.table, nameValueMap, teamsMode, previousVizSelection.elementId);
        }
    }
    currentVizSelection.title = api.state.translations[currentVizSelection.title];
    api.setState('groupMode',teamsMode);
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
    if (teamsMode)
        api.setState('listView', 'sow_landing_page');
    else 
        api.setState('listView', 'sow_landing_page_assigned');
}
