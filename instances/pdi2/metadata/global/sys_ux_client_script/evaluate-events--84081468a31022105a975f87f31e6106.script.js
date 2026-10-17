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
        let intermediate = {};
        for(let key in event.payload["scopesAndAPIs"]) {
            intermediate[key] = {...event.payload["scopesAndAPIs"][key]};
        }
        disableSaveButton(api.state.formFieldAndValues);
    } else if(event.elementId == "look_up_active_users") {
        let activeUsersClientState = [];
        let activeUsersDataBroker = api.data.look_up_active_users.results; 
        for(let index in activeUsersDataBroker) {
            activeUsersClientState.push({
                "id": activeUsersDataBroker[index]["sys_id"]["displayValue"],
                "label": activeUsersDataBroker[index]["name"]["value"],
                "sublabel": activeUsersDataBroker[index]["user_name"]["value"],
            });
        }
        api.setState("activeUsers", activeUsersClientState);
    } else if(event.elementId == "copy_client_secret") {
        let client_secret = api.state.formFieldAndValues.client_secret;
        var successMessage = api.state.translatedMessages.clientSecretCopySuccess;
        var failureMessage = api.state.translatedMessages.clientSecretCopyFailed; 
        copyToClipboard("client_secret", client_secret, successMessage, failureMessage, api, helpers);
    } else if(event.elementId == "get_oauth_entity_metadata") {
        let metadata = api.data.get_oauth_entity_metadata.output;
        for(let key in metadata) {
            if(key == "cc_enabled" && metadata[key] == 'false')
                showNotification(api, "cc_property", "warning", api.state.translatedMessages.ccPropertyDisabled);
            else
                api.state.formFieldAndValues[key] = metadata[key];
        }
    } else if(event.elementId == "user_select"){
        api.state.formFieldAndValues["user"] = event.payload.value;
        disableSaveButton(api.state.formFieldAndValues);
    } else if(event.elementId == "token_format_selection"){
        api.state.formFieldAndValues["token_format"] = event.payload.value;
        disableSaveButton(api.state.formFieldAndValues);
    } else if(event.elementId == "sub_claim_selection"){
        api.state.formFieldAndValues["sub_claim"] = event.payload.item.id;
        disableSaveButton(api.state.formFieldAndValues);
    } else if(event.elementId == "save") {
        let scopes = Object.keys(api.state.formFieldAndValues.scopesAndAPIs).map(k=> api.state.formFieldAndValues.scopesAndAPIs[k]["selectedScope"]).filter(scope => (scope.length != 0));

        let useraccountScopePresent = scopes.indexOf(api.data.get_oauth_entity_metadata.output.useraccountScope);
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
    } else if (event.elementId == "update_oauth_entity_record") {
        var result = api.data.update_oauth_entity_record.output;
        if(result["error"] != undefined) {
            showNotification(api, "update_error", "critical", result.error_message);
            api.setState("disableSave", true);
        }
    } else if (event.name == "NOW_INPUT#INVALID_SET") {
        if(event.payload.fieldValue == '') {
            api.state.formFieldAndValues[event.payload.name] = event.payload.fieldValue;
            api.setState("disableSave", true);
        }
    } else if(event.elementId == "create_oauth_client") {
            // Create client button selected in modal that encourages auth scope selection i.e. save without any scopes
            save();
    } else {
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
        disableSaveButton(api.state.formFieldAndValues);
    }

    function disableSaveButton(formData) {
        let disableSave = false;
        let mandatoryFields = ["name", "user", "access_token_lifespan", "integration_registry_input"];
        for(let fieldIndex in mandatoryFields) {
            let mandatoryFieldValue = formData[mandatoryFields[fieldIndex]] || '';
            mandatoryFieldValue = String(mandatoryFieldValue);
            if (mandatoryFieldValue.trim() == '') {
                disableSave = true;
                break;
            }
        }
        api.setState("disableSave", disableSave);
    }
}
