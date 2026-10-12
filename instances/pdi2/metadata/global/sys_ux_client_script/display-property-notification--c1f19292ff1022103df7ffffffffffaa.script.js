/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { showNotification,isPropertyEnabled} = imports["global.APIAuthenticationConsoleUtil"]();
    if(api.data.get_oauth_entity_record_1.output.cc_enabled == 'false' && !api.state.displayErrorNotification)
    {
        api.setState("displayErrorNotification",true);
        showNotification(api, "cc_property", "warning", api.state.translatedMessages.ccPropertyDisabled);
    }
}
