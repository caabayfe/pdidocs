/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    let oidcProviderFields = ["oidc_config_cache_life_span", "oidc_name", "oidc_url", "active", "enable_jti_verification", "jti_claim", "user_field", "user_claim"];
    let oauthOIDCEntityFields = ["name", "client_id", "active", "comments", "integration_registry_input", "scope_restriction_status"];
    const { getScopeRestrictionInfo, showNotification, disableSave, isSameScopesAndAPIs, areAPIsSame, copyTpClipboard } = imports["global.APIAuthenticationConsoleUtil"]();
    if(event.elementId == "oidc_provider_config_radio_buttons") {
        api.setState("oidcProviderConfig", event.payload.value);
        if(event.payload.value == "new_oidc_provider") {
            api.state.formFieldAndValues["oidc_provider_configuration"] = {"jti_claim": "jti", "enable_jti_verification": "true", "user_field": "email"};
            api.setState("disableEditOIDCRecord", false);
            api.setState("isNewOIDCProviderConfig", true);
            api.setState("enableJTIVerification", true);
        } else {
            setOIDCProviderFiels(api, api.data.get_oauth_entity_record.output.oidc_provider_configuration);
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
        api.data.get_oauth_entity_record.refresh();
    } else if (event.elementId == "get_oauth_entity_record") {
        let oauthOIDCEntity = api.data.get_oauth_entity_record.output;
        if(oauthOIDCEntity.error != undefined) {
            showNotification(api, "search_error", "critical", oauthOIDCEntity.error);
            api.setState("invalidRecord", true);
            api.setState("disableSave", true);
        } else if (!oauthOIDCEntity.scope_info.is_same_scope){
            api.setState("invalidRecord", true);
            const errorMessage = await helpers.translate("This record is in the {0} application, but {1} is the current application. To edit this record please change the application scope.", oauthOIDCEntity.scope_info.record_scope, oauthOIDCEntity.scope_info.curent_application_scope); 
            showNotification(api, "scope_error", "critical", errorMessage);
        } else {
            api.setState("scopeRestrictionInfo", getScopeRestrictionInfo(oauthOIDCEntity.scope_restriction_status, api.state.translatedMessaged.scopeRestriction));
            api.setState("scopeStatusRestricted", oauthOIDCEntity.scope_restriction_status == "restricted");
            api.state.formFieldAndValues["scope_restriction_status"] = oauthOIDCEntity.scope_restriction_status;
            for (let field in oauthOIDCEntity) {
                if(field == "oidc_provider_configuration") continue;
                    api.state.formFieldAndValues[field] = oauthOIDCEntity[field];
            }
            setOIDCProviderFiels(api, oauthOIDCEntity.oidc_provider_configuration);
        }
    } else if (event.elementId == "exisiting_oidc_provider_config_select") {
        let newOIDCProviderConfig = {};
        let selectedOIDCProviderConfig = event.payload.item["id"];
        let oidcProvider = api.state.oidcProviderRecords[selectedOIDCProviderConfig];
        for(let key in oidcProvider) {
            newOIDCProviderConfig[key] = oidcProvider[key]["displayValue"];
            if(key == "enable_jti_verification")
                api.setState("enableJTIVerification", newOIDCProviderConfig[key]=='true');
        }
        api.state.formFieldAndValues["oidc_provider_configuration"] = newOIDCProviderConfig;
        var intermediate = {};
        for(var key in api.state.formFieldAndValues) {
            intermediate[key] = api.state.formFieldAndValues[key];
        }
        api.setState('formFieldAndValues', intermediate);
        isSameForm(api.data.get_oauth_entity_record.output, api.state.formFieldAndValues);
    } else if (event.name == "NOW_INPUT#INVALID_SET" || event.name == "NOW_INPUT_URL#INVALID_SET") {
        let elementIDs = ["lifespan_input", "name_input", "client_id_input", "existing_oidc_provider_name_input", "new_oidc_provider_config_input", "metadata_input_url"];
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
    }  else if(event.name == "SCOPE_AND_APIS_CHANGED") {
        api.state.formFieldAndValues["scopesAndAPIs"] = {...event.payload["scopesAndAPIs"]};
        if(event.payload["onLoad"] == "true") {
            var intermediate = {};
            for(var key in event.payload["scopesAndAPIs"]) {
                intermediate[key] = {...event.payload["scopesAndAPIs"][key]};
            }
            api.setState("initialScopesAndAPI", {...intermediate});
        } else {
            isSameForm(api.data.get_oauth_entity_record.output, api.state.formFieldAndValues);
        }
    }  else if(event.elementId == "save_button") {
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
        intermediate["oidc_provider_configuration"] = {...api.state.formFieldAndValues["oidc_provider_configuration"]};
        if(api.state.isNewOIDCProviderConfig) {
            intermediate["oidc_provider_configuration"]["isNew"] = "true";
        } else {
            let oidcEntityInDB = api.data.get_oauth_entity_record.output.oidc_provider_configuration;
            if(isSameOIDCProviderConfig(api.state.oidcProviderRecords[oidcEntityInDB], api.state.formFieldAndValues["oidc_provider_configuration"])) {
                intermediate["oidc_provider_configuration"]["isSame"] = "true";
            } else {
                intermediate["oidc_provider_configuration"]["isSame"] = "false";
            }
        }
        api.setState('formFieldAndValuesFinal', intermediate);
    } else if (event.elementId == "update_oauth_entity_record") {
        showNotification(api, "update_error", "critical", api.data.update_oauth_entity_record.output.error_message);
        api.setState("disableSave", true);
    } else if (event.elementId == "user_field_select") {
        let oidc = api.state.formFieldAndValues["oidc_provider_configuration"];
        oidc["user_field"] = event.payload.item.id;
        isSameForm(api.data.get_oauth_entity_record.output, api.state.formFieldAndValues);
    } else if(event.elementId == 'rest_api_auth_scopes_mapping_1' && event.name == 'SCOPE_RESTRICTION_STATUS_CHANGED') {
        api.setState("scopeStatusRestricted", event.payload.scope_restriction_status);
        api.state.formFieldAndValues["scope_restriction_status"] = (event.payload.scope_restriction_status == true) ? "restricted" : "unrestricted";
        isSameForm(api.data.get_oauth_entity_record.output, api.state.formFieldAndValues);
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

        api.state.formFieldAndValues["oidc_provider_configuration"] = {...api.state.formFieldAndValues["oidc_provider_configuration"] };
        api.setState("formFieldAndValues", {...api.state.formFieldAndValues});

        isSameForm(api.data.get_oauth_entity_record.output, api.state.formFieldAndValues);
    }

    function setOIDCProviderFiels(api, oidcProviderInOauthEntitySysID) {
        let oidcProviderConfigurationClientState = api.state.formFieldAndValues["oidc_provider_configuration"];
        let oidcProviderInOauthEntity = api.state.oidcProviderRecords[oidcProviderInOauthEntitySysID];
        for(let key in oidcProviderInOauthEntity) {
            oidcProviderConfigurationClientState[key] = oidcProviderInOauthEntity[key]["displayValue"];
            if(key == "enable_jti_verification")
                api.setState("enableJTIVerification", oidcProviderConfigurationClientState[key]=='true');
        }
        api.state.formFieldAndValues["oidc_provider_configuration"] = {...api.state.formFieldAndValues["oidc_provider_configuration"] };
    }

    function areMandatoryFieldsPresent(fromForm) {
        let fieldsPresent = true;
        let mandatoryFields = ["name", "client_id", "oidc_name", "oidc_url", "oidc_config_cache_life_span", "integration_registry_input"];
        mandatoryFields.forEach(field => {
            if(oauthOIDCEntityFields.indexOf(field) != -1) {
                let mandatoryFieldValue =  fromForm[field] || '';
                mandatoryFieldValue = String(mandatoryFieldValue);
                if(mandatoryFieldValue.trim() == "")
                    fieldsPresent = false;
            }
            if(oidcProviderFields.indexOf(field) != -1) {
                let mandatoryFieldValue =  fromForm['oidc_provider_configuration'][field] || '';
                if(field == "oidc_name")
                    mandatoryFieldValue =  fromForm['oidc_provider_configuration']['name'] || '';
                mandatoryFieldValue = String(mandatoryFieldValue);
                if(mandatoryFieldValue.trim() == "")
                    fieldsPresent = false;
            }
        });
        if(fromForm['oidc_provider_configuration']['oidc_config_cache_life_span'] < 1 || fromForm['oidc_provider_configuration']['oidc_config_cache_life_span'] > 720) {
            api.setState("lifepsan_error", true);
            fieldsPresent = false;
        } else {
            api.setState("lifepsan_error", false);
        }
        return fieldsPresent;
    }

    function isSameForm(fromDB, fromForm) {
        if(areMandatoryFieldsPresent(fromForm) == false) {
            api.setState("disableSave", true);
            return;
        }
        let disableSave = true;

        for (let key in fromForm) {
            if(key == "scope_info") continue;
            
            if (key == "scopesAndAPIs") {
                if (!isSameScopesAndAPIs(api.state.initialScopesAndAPI, fromForm[key])) {
                    disableSave = false;
                    break;
                }
                continue;
            }
            
            if (key == "oidc_provider_configuration") {
                let oidcInDB = api.state.oidcProviderRecords[fromDB["oidc_provider_configuration"]];
                let oidcInForm = fromForm["oidc_provider_configuration"];
                
                if (isSameOIDCProviderConfig(oidcInDB, oidcInForm) == false) {
                    disableSave = false;
                    break;
                }
                continue;
            }

            if (String(fromDB[key]) != String(fromForm[key])) {
                disableSave = false;
                break;
            }
        }
        api.setState("disableSave", disableSave);
    }

    function isSameOIDCProviderConfig(oidcInDB, oidcInForm) {
        let isSame = true;
        for (let oidcKey in oidcInDB) {
            if(String(oidcInDB[oidcKey]["displayValue"]) != String(oidcInForm[oidcKey])) {
                isSame = false;
                break;
            }
        }
        return isSame;
    }
}
