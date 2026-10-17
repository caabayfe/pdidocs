/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    //Link Selected
    if(!api.state.collapseRightPanel){
        api.setState("collapseRightPanel", true);
    }
}
