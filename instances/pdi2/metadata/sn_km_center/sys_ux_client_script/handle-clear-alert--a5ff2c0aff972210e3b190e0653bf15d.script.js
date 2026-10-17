/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const utils = imports["sn_km_center.ArticleAssistUIUtils"](api, helpers);
    
    utils.clearAlert(event.payload.message);
}
