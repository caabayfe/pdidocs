/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    let selectedTabIndex = event.payload.selectedTabIndex;
    let id = api.state.currentTabs[selectedTabIndex].id;
    api.setState('selectedTabIndex', selectedTabIndex);
    api.setState('selectedMetric', id);
    
}
