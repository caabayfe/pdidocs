/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { getScopeRestrictionInfo, showNotification, disableSave, isSameScopesAndAPIs, areAPIsSame, copyToClipboard, getClientSecretFieldLevelAlert } = imports["global.APIAuthenticationConsoleUtil"]();
    if(event.elementId == "get_oauth_entity_record_1") {
        var output = api.data.get_oauth_entity_record_1.output;
        if(output.error != undefined) {
            showNotification(api, "search_error", "critical", output.error);
            api.setState("invalidRecord", true);
            api.setState("disableSave", true);
        } else if (!output.scope_info.is_same_scope){
            api.setState("invalidRecord", true);
            const errorMessage = await helpers.translate("This record is in the {0} application, but {1} is the current application. To edit this record please change the application scope.", output.scope_info.record_scope, output.scope_info.curent_application_scope); 
            showNotification(api, "scope_error", "critical", errorMessage);
        } else {
            var copyOutput = {...output};
            let isOpaqueToken = output.token_format == 'opaque' ? true : false;
            api.setState('isOpaqueTokenFromat', isOpaqueToken);
            copyOutput["scopesAndAPIs"] = api.state.formFieldAndValues["scopesAndAPIs"];
            api.setState("enableJTIVerification", copyOutput.enable_jti_verification);
            api.setState('formFieldAndValues', copyOutput);
            api.setState("scopeRestrictionInfo", getScopeRestrictionInfo(copyOutput.scope_restriction_status, api.state.translatedMessages.scopeRestriction));
        }
    } else if(event.elementId == "save") {
        let scopes = Object.keys(api.state.formFieldAndValues.scopesAndAPIs).map(k=> api.state.formFieldAndValues.scopesAndAPIs[k]["selectedScope"]).filter(scope => (scope.length != 0));
        let useraccountScopePresent = scopes.indexOf(api.data.get_oauth_entity_metadata_1.output.useraccountScope);
        if(useraccountScopePresent > -1)
            api.state.formFieldAndValues["scope_restriction_status"] = "useraccount";
        else 
            api.state.formFieldAndValues["scope_restriction_status"] = api.state.scopeStatusRestricted ? "restricted" : "unrestricted";
        var intermediate = {};
        for(var key in api.state.formFieldAndValues) {
            intermediate[key] = api.state.formFieldAndValues[key];
        }
        intermediate["scopesAndAPIs"] = api.state.formFieldAndValues["scopesAndAPIs"];
        api.setState('formFieldAndValuesFinal', intermediate);
    } else if(event.elementId == "user_field"){
        api.state.formFieldAndValues["user_field"] = event.payload.value;
        var disableSaveAction = disableSave(api, api.data.get_oauth_entity_record_1.output, api.state.formFieldAndValues);
        api.setState("disableSave", api.state.invalidRecord || disableSaveAction);
    } else if(event.elementId == "token_format_selection_jwt_edit"){
        api.state.formFieldAndValues["token_format"] = event.payload.value;
        var disableSaveAction = disableSave(api, api.data.get_oauth_entity_record_1.output, api.state.formFieldAndValues);
        api.setState("disableSave", api.state.invalidRecord || disableSaveAction);
    } else if(event.elementId == "sub_claim_selection_jwt_edit"){
        api.state.formFieldAndValues["sub_claim"] = event.payload.item.id;
        var disableSaveAction = disableSave(api, api.data.get_oauth_entity_record_1.output, api.state.formFieldAndValues);
        api.setState("disableSave", api.state.invalidRecord || disableSaveAction);
    } else if(event.elementId == "update_oauth_entity_record_1") {
        var result = api.data.update_oauth_entity_record_1.output;
        if(result["error"] != undefined) {
            showNotification(api, "update_error", "critical", result.error_message);
            api.data.get_oauth_entity_record_1.refresh(); // reset the values on form if error while updating the records
        }
        api.setState("disableSave", true);
    } else if(event.name == "SCOPE_AND_APIS_CHANGED") {
        api.state.formFieldAndValues["scopesAndAPIs"] = {...event.payload["scopesAndAPIs"]};
        if(event.payload["onLoad"] == "true") {
            var intermediate = {};
            for(var key in event.payload["scopesAndAPIs"]) {
                intermediate[key] = {...event.payload["scopesAndAPIs"][key]};
            }
            api.setState("initialScopesAndAPI", {...intermediate});
        } else {
            var disableSaveAction = disableSave(api, api.data.get_oauth_entity_record_1.output, api.state.formFieldAndValues);
            api.setState("disableSave", disableSaveAction);
        }
    } else if (event.elementId == "client_secret_button") {
        let successMessage = await helpers.translate("Client secret copied to clipboard.");
        let failureMessage = await helpers.translate("Failed to copy Client secret to clipboard.");
        copyToClipboard("client_secret", api.state.formFieldAndValues.client_secret, successMessage, failureMessage, api, helpers);
    } else if (event.name == "NOW_INPUT#INVALID_SET" || event.name == "NOW_INPUT_URL#INVALID_SET") {
        let mandatoryFields = ['name', 'access_token_lifespan', 'integration_registry_input'];
        if(mandatoryFields.indexOf(event.payload.name) != -1) {
            if(event.payload.fieldValue == undefined || event.payload.fieldValue == '') {
                api.state.formFieldAndValues[event.payload.name] = event.payload.fieldValue;
                api.setState("disableSave", true);
            }
        }

        if(event.elementId == "jwks_input_url") {
            let invalidJWKSURL = event.payload.value;
            api.setState('invalidJWKSURL', invalidJWKSURL);
            disableSaveAction(api, invalidJWKSURL);
        }

    } else {
        if(event.elementId == 'rest_api_auth_scopes_mapping_1' && event.name == 'SCOPE_RESTRICTION_STATUS_CHANGED') {
            api.setState("scopeStatusRestricted", event.payload.scope_restriction_status);
            api.state.formFieldAndValues["scope_restriction_status"] = (event.payload.scope_restriction_status == true) ? "restricted" : "unrestricted";
        }
        let invalidJWKSURL = api.state.invalidJWKSURL;
        if(event.elementId == "jwks_input_url") {
            api.setState('invalidJWKSURL', false);
            invalidJWKSURL = false;
        }
        let fieldName = event.payload.name;
        let fieldValue = event.payload.fieldValue || event.payload.value;
        if(event.elementId == 'rest_api_auth_scopes_mapping_1' && event.name == 'SCOPE_RESTRICTION_STATUS_CHANGED') {
            api.setState("scopeStatusRestricted", event.payload.scope_restriction_status);
            api.state.formFieldAndValues["scope_restriction_status"] = (event.payload.scope_restriction_status == true) ? "restricted" : "unrestricted";
        } else
            api.state.formFieldAndValues[fieldName] = fieldValue;
        api.setState("formFieldAndValues", {...api.state.formFieldAndValues});
         if (fieldName == 'client_secret' && fieldValue) {
            let alertMsgs = await getClientSecretFieldLevelAlert(api, helpers, fieldValue.length);
            api.setState('clientSecretFieldLevelAlert', {
                "msgs": alertMsgs
            });
        }
        disableSaveAction(api, invalidJWKSURL);
    }

    function disableSaveAction(api, invalidJWKSURL) {
        let disableSaveAction = false;
        let mandatoryFields = ['name', 'access_token_lifespan', 'integration_registry_input'];
        for (let index in mandatoryFields) {
            let mandatoryFieldValue = api.state.formFieldAndValues[mandatoryFields[index]] || '';
            mandatoryFieldValue = String(mandatoryFieldValue);
            if (mandatoryFieldValue.trim() == '') {
                disableSaveAction = true;
            }
        }
        if(disableSaveAction == false)
            disableSaveAction = disableSave(api, api.data.get_oauth_entity_record_1.output, api.state.formFieldAndValues);
    
        api.setState("disableSave", api.state.invalidRecord || disableSaveAction || invalidJWKSURL);
    }
}
