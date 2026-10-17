/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    function save() {
        var intermediate = {};
        for(var key in api.state.formFieldAndValues) {
            intermediate[key] = api.state.formFieldAndValues[key];
        }
        intermediate["scopesAndAPIs"] = api.state.formFieldAndValues["scopesAndAPIs"];
        intermediate["oidc_provider_configuration"] = {...api.state.formFieldAndValues["oidc_provider_configuration"]};
        if(api.state.isNewOIDCProviderConfig) {
            intermediate["oidc_provider_configuration"]["isNew"] = "true";
        }
        api.setState('formFieldAndValuesFinal', intermediate);
    }
    let oidcProviderFields = ["oidc_config_cache_life_span", "oidc_name", "oidc_url", "active", "enable_jti_verification", "jti_claim", "user_field", "user_claim"];
    let oauthOIDCEntityFields = ["name", "client_id", "active", "comments", "integration_registry_input"];

    const { showNotification, disableSave, isSameScopesAndAPIs, areAPIsSame, copyTpClipboard } = imports["global.APIAuthenticationConsoleUtil"]();

    if(event.elementId == "oidc_provider_config_radio_buttons") {
        api.setState("oidcProviderConfig", event.payload.value);
        if(event.payload.value == "new_oidc_provider") {
            api.state.formFieldAndValues["oidc_provider_configuration"] = {"jti_claim": "jti", "enable_jti_verification": "true", "user_field": "email"};
            api.setState("disableEditOIDCRecord", false);
            api.setState("isNewOIDCProviderConfig", true);
            api.setState("enableJTIVerification", true);
        } else {
            setOIDCProviderFields(api, api.state.oidcProviderSelectList[0]["id"]);
            api.setState("disableEditOIDCRecord", true);
            api.setState("isNewOIDCProviderConfig", false);
        }

    } else if (event.elementId == "look_up_multiple_records") {
        let oidcProviderSelectListClientState = [];
        let oidcProviderRecords = {};
        api.data.look_up_multiple_records.results.forEach((record) => {
            oidcProviderRecords[record["sys_id"]["displayValue"]] = {...record};
            oidcProviderSelectListClientState.push({
                "id": record["sys_id"]["displayValue"],
                "label": record["name"]["displayValue"],
                "sublabel": record["oidc_url"]["displayValue"]
            });
        });
        api.setState("oidcProviderSelectList", oidcProviderSelectListClientState);
        api.setState("oidcProviderRecords", oidcProviderRecords);
        setOnLoadOIDCProviderFields(api, oidcProviderRecords[oidcProviderSelectListClientState[0]["id"]]);
    } else if (event.elementId == "exisiting_oidc_provider_config_select") {
        let newOIDCProviderConfig = {};
        let selectedOIDCProviderConfig = event.payload.item["id"];
        let oidcProvider = api.state.oidcProviderRecords[selectedOIDCProviderConfig];

        for (let key in oidcProvider) {
            newOIDCProviderConfig[key] = oidcProvider[key]["displayValue"];
            if(key == "enable_jti_verification")
                api.setState("enableJTIVerification", newOIDCProviderConfig[key]=='true');
        }

        api.state.formFieldAndValues["oidc_provider_configuration"] = newOIDCProviderConfig;
        var intermediate = {};
        for(var key in api.state.formFieldAndValues) {
            intermediate[key] = api.state.formFieldAndValues[key];
        }
        api.setState("formFieldAndValues", intermediate);
        areMandatoryFieldSet(api.state.formFieldAndValues);

    } else if (event.name == "NOW_INPUT#INVALID_SET" || event.name == "NOW_INPUT_URL#INVALID_SET") {
 
        let elementIDs = ["integration_registry_input", "lifespan_input", "name_input", "client_id_input", "existing_oidc_provider_name_input", "new_oidc_provider_config_input", "metadata_input_url"];

        if(oidcProviderFields.indexOf(event.payload.name) != -1) {
            
            api.state.formFieldAndValues["oidc_provider_configuration"][event.payload.name] = event.payload.fieldValue;

        }
        if(oauthOIDCEntityFields.indexOf(event.payload.name) != -1) {
            api.state.formFieldAndValues[event.payload.name] = event.payload.fieldValue;

        }

        if(elementIDs.indexOf(event.elementId) != -1) {
            // required field set empty, disable the save button
            if(event.payload.fieldValue == undefined || event.payload.fieldValue == '')
                api.setState("disableSave", true);
        }
        areMandatoryFieldSet(api.state.formFieldAndValues);

    }  else if(event.name == "SCOPE_AND_APIS_CHANGED") {
        api.state.formFieldAndValues["scopesAndAPIs"] = {...event.payload["scopesAndAPIs"]};
        if(event.payload["onLoad"] == "true") {
            var intermediate = {};
            for(var key in event.payload["scopesAndAPIs"]) {
                intermediate[key] = {...event.payload["scopesAndAPIs"][key]};
            }
            api.setState("initialScopesAndAPI", {...intermediate});
        }
    }  
    else if(event.elementId == "save_button") {
        let scopes = Object.keys(api.state.formFieldAndValues.scopesAndAPIs).map(k=> api.state.formFieldAndValues.scopesAndAPIs[k]["selectedScope"]).filter(scope => (scope.length != 0));
        let useraccountScopePresent = scopes.indexOf(api.data.get_oauth_entity_metadata_1.output.useraccountScope);
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
    } else if(event.elementId == "cancel_button") {
        helpers.navigate.to("inbound-integrations" , { "timestamp" : Date.now()});
    } 
    else if (event.elementId == "update_oauth_entity_record") {

        var result = api.data.update_oauth_entity_record.output;
        if(result["error"] != undefined) {
            showNotification(api, "update_error", "critical", result.error_message);
            api.setState("disableSave", true);
        } else {
            helpers.navigate.to("inbound-integrations" , {"timestamp" : Date.now()});
        }
    } else if (event.elementId == "user_field_select") {
        let oidc = api.state.formFieldAndValues["oidc_provider_configuration"];
        oidc["user_field"] = event.payload.item.id;
    } else {
        if(oauthOIDCEntityFields.indexOf(event.payload.name) != -1) {
            if(event.payload.name != "comments")
                api.state.formFieldAndValues[event.payload.name] = event.payload.value;
            else
                api.state.formFieldAndValues[event.payload.name] = event.payload.fieldValue;
        }

        if(oidcProviderFields.indexOf(event.payload.name) != -1) {
            let oidc = api.state.formFieldAndValues["oidc_provider_configuration"];
            if(event.payload.name == "oidc_name")
                oidc["name"] = event.payload.value;    
            else
                oidc[event.payload.name] = event.payload.value;
        }
        areMandatoryFieldSet(api.state.formFieldAndValues);
        api.state.formFieldAndValues["oidc_provider_configuration"] = {...api.state.formFieldAndValues["oidc_provider_configuration"] };
        api.setState("formFieldAndValues", {...api.state.formFieldAndValues});
    }

    function setOIDCProviderFields(api, oidcProviderInOauthEntitySysID) {
        let oidcProviderConfigurationClientState = api.state.formFieldAndValues["oidc_provider_configuration"];
        let oidcProviderInOauthEntity = api.state.oidcProviderRecords[oidcProviderInOauthEntitySysID];
        for(let key in oidcProviderInOauthEntity) {
            oidcProviderConfigurationClientState[key] = oidcProviderInOauthEntity[key]["displayValue"];
            if(key == "enable_jti_verification")
                api.setState("enableJTIVerification", oidcProviderConfigurationClientState[key]=='true');
        }
    }

    function setOnLoadOIDCProviderFields(api, oidcProviderInOauthEntity) {
        let oidcProviderConfigurationClientState = api.state.formFieldAndValues["oidc_provider_configuration"];
        for(let key in oidcProviderInOauthEntity) {
            oidcProviderConfigurationClientState[key] = oidcProviderInOauthEntity[key]["displayValue"];
            if(key == "enable_jti_verification")
                api.setState("enableJTIVerification", oidcProviderConfigurationClientState[key]=='true');
        }
    }

    function areMandatoryFieldSet(formValue) {
        let oAuthMandatoryFields = ["name", "client_id", "integration_registry_input"];
        let oidcConfigMandatoryFields = ["oidc_config_cache_life_span", "name", "oidc_url"];
        let areMandatoryFieldsFilled = true;
        oAuthMandatoryFields.forEach((mandatoryField) => {
            let mandatoryFieldValue = api.state.formFieldAndValues[mandatoryField] || '';
            mandatoryFieldValue = String(mandatoryFieldValue);
            if (mandatoryFieldValue.trim() == '') {
                areMandatoryFieldsFilled = false;
                return;
            }
        });
        oidcConfigMandatoryFields.forEach((mandatoryField) => {
            let mandatoryFieldValue = api.state.formFieldAndValues["oidc_provider_configuration"][mandatoryField] || '';
            mandatoryFieldValue = String(mandatoryFieldValue);
            if (mandatoryFieldValue.trim() == '') {
                areMandatoryFieldsFilled = false;
                return;
            }
        });

        if(formValue['oidc_provider_configuration']['oidc_config_cache_life_span'] < 1 || formValue['oidc_provider_configuration']['oidc_config_cache_life_span'] > 720) {
            api.setState("lifepsan_error", true);
            areMandatoryFieldsFilled = false;
        } else {
            api.setState("lifepsan_error", false);
        }

        api.setState("disableSave", !areMandatoryFieldsFilled);

    }

}
