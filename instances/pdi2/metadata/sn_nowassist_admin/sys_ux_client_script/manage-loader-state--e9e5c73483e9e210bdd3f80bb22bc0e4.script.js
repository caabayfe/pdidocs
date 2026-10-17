/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    event.name == "DATA_OP_INITIATED" ? api.setState("hideLoader", false) :   api.setState("hideLoader", true);
}
