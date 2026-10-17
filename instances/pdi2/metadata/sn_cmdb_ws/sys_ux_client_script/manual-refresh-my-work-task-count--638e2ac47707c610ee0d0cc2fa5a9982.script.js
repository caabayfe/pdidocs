/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var manualRefreshState = api.state.myWorkTaskCountManualRefresh;
    manualRefreshState.manualRefresh = true;
    api.setState("myWorkTaskCountManualRefresh", manualRefreshState);
    api.data.get_my_work_task_count_1.refresh();
}
