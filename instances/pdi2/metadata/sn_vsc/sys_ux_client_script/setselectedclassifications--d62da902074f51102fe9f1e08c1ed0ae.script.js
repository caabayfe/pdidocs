/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var data = api.data.sc_get_saved_export_setting_1.output || [];
    if(data){
        api.setState("selectedClassifications", data);
    }
}
