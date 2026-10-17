/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { showNotification } = imports["global.APIAuthenticationConsoleUtil"]();
    var result = api.data.update_oauth_entity_record_1.output;
    if(result["error"] != undefined) {
        showNotification(api, "update_error", "critical", result.error_message);
        api.setState("disableSave", true);
    }
}
