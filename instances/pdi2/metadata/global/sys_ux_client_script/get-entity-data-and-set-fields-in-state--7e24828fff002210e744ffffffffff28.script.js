/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {getScopeRestrictionInfo, showNotification} = imports["global.APIAuthenticationConsoleUtil"]();
    let output = api.data.get_oauth_entity_record_1.output;
    if(output.error != undefined) {
        showNotification(api, "search_error", "critical", output.error);
        api.setState("invalidRecord", true);
        api.setState("disableSave", true);
    } else if (!output.scope_info.is_same_scope){
        api.setState("invalidRecord", true);
        let errorMessage = await helpers.translate("This record is in the {0} application, but {1} is the current application. To edit this record please change the application scope.", output.scope_info.record_scope, output.scope_info.curent_application_scope); 
        showNotification(api, "scope_error", "critical", errorMessage);
    } else {
        let copyOutput = {...output};
        let isOpaqueToken = output.token_format == 'opaque' ? true : false;
        api.setState('isOpaqueTokenFromat', isOpaqueToken);
        api.setState('formFieldAndValues', copyOutput);
        api.setState("scopeRestrictionInfo", getScopeRestrictionInfo(copyOutput.scope_restriction_status, api.state.translatedMessages.scopeRestriction));
    }
}
