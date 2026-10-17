/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (event.name == "SN_ENHANCED_CONTENT_EDITOR#CONTENT_UPDATED") {
        api.setState("eceLastUpdate", Date.now());
    }

}
