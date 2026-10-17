/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const { showNotification }  = imports["global.APIAuthenticationConsoleUtil"]();
    let result = api.data.update_oauth_entity_record_1.output;
    if (result["error"] != undefined) {
        showNotification(api, "update_error", "critical", result.error_message);
        await api.data.get_oauth_entity_record_1.refresh(); // reset the values on form  
    } 
    api.setState("disableSave", true);
}
