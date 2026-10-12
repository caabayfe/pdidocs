/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState("storeExecTrackerState", "1"); // Running
    api.data.trigger_store_apps_fetch.refresh();
}
