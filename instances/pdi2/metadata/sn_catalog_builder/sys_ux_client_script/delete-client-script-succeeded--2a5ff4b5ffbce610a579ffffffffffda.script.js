/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
const response = event.payload.data.output.result;
    // Refresh list
    api.setState('listRefreshPayload', {
        timestamp: Date.now()
    });
}
