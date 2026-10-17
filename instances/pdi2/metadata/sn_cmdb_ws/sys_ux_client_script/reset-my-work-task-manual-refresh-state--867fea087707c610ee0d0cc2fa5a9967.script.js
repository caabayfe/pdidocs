/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var manualRefreshState = api.state.myWorkTaskCountManualRefresh;
    manualRefreshState.manualRefresh = false;
    api.setState('myWorkTaskCountManualRefresh', manualRefreshState);
}
