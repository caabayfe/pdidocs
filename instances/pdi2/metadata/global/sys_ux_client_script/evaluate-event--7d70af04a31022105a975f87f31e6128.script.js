/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    function save() {
        let intermediate = {};
        for(let key in api.state.formFieldAndValues) {
            intermediate[key] = api.state.formFieldAndValues[key];
        }
        intermediate["scopesAndAPIs"] = {...api.state.formFieldAndValues["scopesAndAPIs"]};
        api.setState('formFieldAndValuesFinal', intermediate);
        api.state.formFieldAndValues["token_format"] = "opaque";
        api.state.formFieldAndValues["sub_claim"] = "user_name";
    }
    const { showNotification, disableSave, isSameScopesAndAPIs, areAPIsSame, copyToClipboard, getClientSecretFieldLevelAlert } = imports["global.APIAuthenticationConsoleUtil"]();

    if(event.name == "SCOPE_AND_APIS_CHANGED") {
        api.state.formFieldAndValues["scopesAndAPIs"] = {...event.payload["scopesAndAPIs"]};
        var intermediate = {};
        for(var key in event.payload["scopesAndAPIs"]) {
            intermediate[key] = {...event.payload["scopesAndAPIs"][key]};
        }
    } else if(event.elementId == "user_field"){
        api.state.formFieldAndValues["user_field"] = event.payload.value;
    } else if(event.elementId == "save_button") {
        let scopes = Object.keys(api.state.formFieldAndValues.scopesAndAPIs).map(k=> api.state.formFieldAndValues.scopesAndAPIs[k]["selectedScope"]).filter(scope => (scope.length != 0));

        let useraccountScopePresent = scopes.indexOf(api.data.get_oauth_entity_metadata_2.output.useraccountScope);
        if(useraccountScopePresent > -1)
            api.state.formFieldAndValues["scope_restriction_status"] = "useraccount";
        else
            api.state.formFieldAndValues["scope_restriction_status"] = (api.state.scopeRestrictionStatus == true) ? "restricted" : "unrestricted";

        let noScopes = (scopes.length == 0);
        if(noScopes) {
            // if no scopes selected, open the modal that encourages auth scope selection
            helpers.modal.open("create_oauth_client");
        } else
            save();
    } else if(event.elementId == "create_oauth_client") {
            // Create client button selected in modal that encourages auth scope selection i.e. save without any scopes
            save();
    } else if (event.elementId == "update_oauth_entity_record_1") {
        var result = api.data.update_oauth_entity_record_1.output;
        if(result["error"] != undefined) {
            showNotification(api, "update_error", "critical", result.error_message);
            api.setState("disableSave", true);
        }
    } else if(event.elementId == "copy_client_secret") {
        let client_secret = api.state.formFieldAndValues.client_secret;
        var successMessage = api.state.translatedMessages.clientSecretCopySuccess;
        var failureMessage = api.state.translatedMessages.clientSecretCopyFailed; 
        copyToClipboard("client_secret", client_secret, successMessage, failureMessage, api, helpers);
    } else if(event.elementId == "token_format_selection_jwt_new"){
        api.state.formFieldAndValues["token_format"] = event.payload.value;
    } else if(event.elementId == "sub_claim_selection_jwt_new"){
        api.state.formFieldAndValues["sub_claim"] = event.payload.item.id;
    } else if(event.elementId == "get_oauth_entity_metadata_2") {
        let metadata = api.data.get_oauth_entity_metadata_2.output;
        for(let k in metadata) {
            api.state.formFieldAndValues[k] = metadata[k];
        }
    }  else if (event.name == "NOW_INPUT#INVALID_SET" || event.name == "NOW_INPUT_URL#INVALID_SET") {
        let mandatoryFields = ['name', 'access_token_lifespan', 'integration_registry_input'];
        if(mandatoryFields.indexOf(event.payload.name) != -1) {
            if(event.payload.fieldValue == undefined || event.payload.fieldValue == '') {
                api.state.formFieldAndValues[event.payload.name] = event.payload.fieldValue;
                api.setState("disableSave", true);
            }
        }

        if(event.elementId == "jwks_url") {
            api.setState('invalidJWKSURL', event.payload.value);
            api.setState("disableSave", event.payload.value);
        }

    } else {
        let invalidJWKSURL = api.state.invalidJWKSURL;
        if(event.elementId == "jwks_url") {
            invalidJWKSURL = false;
            api.setState('invalidJWKSURL', false);
        }

        let fieldName = event.payload.name;
        let fieldValue = event.payload.fieldValue || event.payload.value;
        api.state.formFieldAndValues[fieldName] = fieldValue;
        api.setState("formFieldAndValues", {...api.state.formFieldAndValues});
        if (fieldName == 'client_secret' && fieldValue) {
            let alertMsgs = await getClientSecretFieldLevelAlert(api, helpers, fieldValue.length);
            api.setState('clientSecretFieldLevelAlert', {
                "msgs": alertMsgs
            });
        }

        let disableSave = false;
        let mandatoryFields = ['name', 'access_token_lifespan', 'integration_registry_input'];
        for (let index in mandatoryFields) {
            let mandatoryFieldValue = api.state.formFieldAndValues[mandatoryFields[index]] || '';
            mandatoryFieldValue = String(mandatoryFieldValue);
            if(mandatoryFieldValue.trim() == '') 
                disableSave = true;
        }
        disableSave = disableSave || invalidJWKSURL;

        api.setState("disableSave", disableSave);
    }
}
