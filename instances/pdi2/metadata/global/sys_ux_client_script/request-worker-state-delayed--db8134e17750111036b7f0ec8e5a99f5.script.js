/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var workerId = api.state.workerId;
    helpers.timing.setTimeout(api.data.progress_worker_state.execute, 5000, { "workerId": workerId });
}
