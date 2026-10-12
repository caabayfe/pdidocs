/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var threshold = (event.payload.item) ? event.payload.value : 0;
    api.setState('threshold', threshold);
}
