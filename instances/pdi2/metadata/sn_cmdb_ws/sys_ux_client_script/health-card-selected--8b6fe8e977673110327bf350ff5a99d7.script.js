/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

    api.setState('selectedHealthCard',event.elementId);
    api.setState('currentTabs',api.state.tabs[event.elementId]);
    let id = api.state.tabs[event.elementId][0].id;
    api.setState('selectedTabIndex', 0);
    api.setState('selectedMetric', id);
    
}
