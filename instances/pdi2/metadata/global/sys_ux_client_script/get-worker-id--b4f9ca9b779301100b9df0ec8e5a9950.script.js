/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var workerId = event.payload.data.workerId.result.workerID;
    if (workerId == null || workerId == 'undefined') {
        // error - user has insufficient privileges
        return;
        }

    // hold the workerID to poll for completion with
    api.setState('workerId', workerId);
}
