function transform(input) {
	// 1. get existing scopes mapped to entity (oauth_entity_auth_scope_mapping)
	// 2. get auth scopes submitted in the form
	// 		2.1 if scope in the form does not exist in DB, its a new scope; create oauth_entity_auth_scope_mapping record
	// 		2.2 create sys_api_access_scope records
	// 3. difference between 1. and 2. = auth scope is removed
	// 		3.1 delete scope mapping oauth_entity_auth_scope_mapping
    function createScopesAndAPIs(oauthEntitySysID, scopesAndAPIs) {
		// get existing scopes mapped to entity
        var scopesMappedToEntityInDB = [];
		let scopesNamesMappedToEntityInDB = {};
		let sysAuthScopeGR = new GlideRecord("sys_auth_scope");
		sysAuthScopeGR.query();
		while(sysAuthScopeGR.next()) {
			scopesNamesMappedToEntityInDB[sysAuthScopeGR.sys_id] = sysAuthScopeGR.getValue("name");
		}
        var oauthEntityAuthScopeMapping = new GlideRecord("oauth_entity_auth_scope_mapping");
        oauthEntityAuthScopeMapping.addQuery("oauth_entity", oauthEntitySysID);
        oauthEntityAuthScopeMapping.query();
        while (oauthEntityAuthScopeMapping.next()) {
            var authScope = oauthEntityAuthScopeMapping.getValue("auth_scope");
            scopesMappedToEntityInDB.push(authScope);
        }
		// get auth scopes submitted in the form
        var scopesMappedToEntityInForm = [];
        for (var index in scopesAndAPIs) {
            var scope = scopesAndAPIs[index]["selectedScope"];
            if (scope == "")
                continue;

            if (scopesMappedToEntityInDB.indexOf(scope) == -1) {
				// if scope in the form does not exist in DB, its a new scope; create oauth_entity_auth_scope_mapping record
                if (createOAuthEntityAuthScopeMapping(oauthEntitySysID, scope) == null) {
                    response["error"] = true;
                    response["error_message"] = gs.getMessage("Failed to create auth scope mapping to oauth entity");
                }
            }
            scopesMappedToEntityInForm.push(scope);
            createSysAPIAccessScopeRecords(scope, scopesAndAPIs[index]["selectedAPIs"], scopesNamesMappedToEntityInDB[scope]);
        }

        deleteScopesFromDBNotInForm(oauthEntitySysID, scopesMappedToEntityInDB, scopesMappedToEntityInForm);
    }

    function deleteScopesFromDBNotInForm(oauthEntitySysID, scopesMappedToEntityInDB, scopesMappedToEntityInForm) {
        // keep scopesMappedToEntityInForm in scopesMappedToEntityInDB, delete rest
        var toDelete = scopesMappedToEntityInDB.filter(x => !scopesMappedToEntityInForm.includes(x));
        var oauthEntityAuthScopeMapping = new GlideRecord("oauth_entity_auth_scope_mapping");
        oauthEntityAuthScopeMapping.addQuery("oauth_entity", oauthEntitySysID);
        oauthEntityAuthScopeMapping.addQuery("auth_scope", "IN", toDelete);
        oauthEntityAuthScopeMapping.deleteMultiple();
    }

    function createOAuthEntityAuthScopeMapping(oauthEntitySysId, authScopeSysId) {
        var oauthEntityAuthScopeMapping = new GlideRecord("oauth_entity_auth_scope_mapping");
        oauthEntityAuthScopeMapping.setValue("oauth_entity", oauthEntitySysId);
        oauthEntityAuthScopeMapping.setValue("auth_scope", authScopeSysId);
        return oauthEntityAuthScopeMapping.insert();
    }

	function deleteAPIAuthScopeRecordIfExists(api) {
		var gr = new GlideRecord("sys_api_access_scope");
		gr.addQuery("active", true);
		gr.addQuery("api", api.label);
		gr.addQuery("api_path", api.path);
		gr.addQuery("apply_all_methods", true);
		gr.addQuery("apply_all_resources", true);
		gr.addQuery("apply_all_versions", true);
		gr.query();
		if(gr.next()) {
			gr.deleteRecord();
		}
	}

    function isRecordNameUnique(sysId) {
        var gr = new GlideRecord("oauth_entity");
        if (sysId) {
            gr.addQuery("sys_id", "!=", sysId);
        }
        gr.addQuery("name", input.fieldNameAndValues["name"]);
        gr.query();
        return !gr.next();
    }

	// 1. get existing rest api access scopes  (sys_api_access_scope)
	// 2. get rest api access scopes submitted in the form
	// 		2.1 api not mapped to scope, create sys_api_access_scope records
	// 3. difference between 1. and 2. = sys_api_access_scope is removed
	// 		3.1 delete sys_api_access_scope
    function createSysAPIAccessScopeRecords(scopeSysId, apis, scopeName) {
        // get existing scope <-> api mappings
        var apisMappedToScopeInDB = {};
        var sysAPIAccessScope = new GlideRecord("sys_api_access_scope");
        sysAPIAccessScope.addQuery("auth_scope", scopeSysId);
        sysAPIAccessScope.query();
        while (sysAPIAccessScope.next()) {
            // removing API and adding back same, we will loose "sys_api_access_scope_sys_id", cant use this logic
            //apisMappedToScopeInDB.push(sysAPIAccessScope.sys_id);
            apisMappedToScopeInDB[sysAPIAccessScope.api_path + "(" + sysAPIAccessScope.api + ")"] = sysAPIAccessScope.getValue("sys_id");
        }
        var apisMappedToScopeInForm = {};
        for (var index in apis) {
            var api = apis[index];
            apisMappedToScopeInForm[api.id] = api.id;

            // removing API and adding back same, we will loose "sys_api_access_scope_sys_id", cant use this logic
            //if(api["sys_api_access_scope_sys_id"]) {}

            // api not mapped to scope, create entry
            if (!apisMappedToScopeInDB[api.id]) {
                if (createSysAPIAccessScopeRecord(scopeSysId, api, scopeName) == null) {
                    response["error"] = true;
                    response["error_message"] = gs.getMessage("Failed to create sys_api_access_scope");
                }
            }
        }

        deleteSysAPIAccessScopeRecordsFromDBNotInForm(apisMappedToScopeInDB, apisMappedToScopeInForm);
    }

    function createSysAPIAccessScopeRecord(scopeSysId, api, scopeName) {
		//delete existing API to auth scope mapping from db as one API can be mapped to a single scope.
		deleteAPIAuthScopeRecordIfExists(api);
        var gr = new GlideRecord("sys_api_access_scope");
        gr.setValue("active", true);
        gr.setValue("api", api.label);
        gr.setValue("api_path", api.path);
        gr.setValue("apply_all_methods", true);
        gr.setValue("apply_all_resources", true);
        gr.setValue("apply_all_versions", true);
        gr.setValue("auth_scope", scopeSysId);
        gr.setValue("name", "AutoGen-" + scopeName + "+" + api.label);
        return gr.insert();
    }

    function deleteSysAPIAccessScopeRecordsFromDBNotInForm(apisMappedToScopeInDB, apisMappedToScopeInForm) {
        // keep apisMappedToScopeInForm in apisMappedToScopeInDB, delete rest
        var toDelete = [];
        for (var key in apisMappedToScopeInDB) {
            if (apisMappedToScopeInForm[key])
                continue;
            toDelete.push(apisMappedToScopeInDB[key]);
        }
        var sysAPIAccessScope = new GlideRecord("sys_api_access_scope");
        sysAPIAccessScope.addQuery("sys_id", "IN", toDelete);
        sysAPIAccessScope.deleteMultiple();
    }

	function validateLoginUrl(trimmedLoginUrl) {
        if (trimmedLoginUrl.startsWith('login_with_sso.do')) {
            if (!trimmedLoginUrl.includes('glide_sso_id')) {
                return gs.getMessage("Please provide sso id for IDP");
            }

            var builder = new SNC.OAuthEntityBuilder(current);
            var idpSysId = builder.getIDPSysId(trimmedLoginUrl);

            if (!builder.validateIDPSysId(idpSysId)) {
                return gs.getMessage("Invalid IDP SysId '{0}'. Please provide correct SAML or OIDC IDP SysId", idpSysId);
            }

        } else if (trimmedLoginUrl !== 'oauth_login.do' && trimmedLoginUrl !== 'login_locate_sso.do') {
            var gr = new GlideRecord('sys_ui_page');
            gr.addQuery("name", trimmedLoginUrl);
            gr.query();

            if (!gr.next()) {
                return gs.getMessage("Please enter a valid UI Page in Login URL.");
            }
        }
        return "valid";
    }


	function isValidOIDCURL(oidcProviderConfigInForm) {
		let oidcProviderTester = new SNC.OIDCProviderTester();
		oidcProviderTester.setGenerateErrorInSession(false);
		let isValid = oidcProviderTester.testProvider(oidcProviderConfigInForm["sys_id"], oidcProviderConfigInForm["name"], oidcProviderConfigInForm["oidc_url"], oidcProviderConfigInForm["oidc_config_cache_life_span"], oidcProviderConfigInForm["user_claim"]);
		return isValid;
	}

	function updateOAuthOIDCEntity(gr, form) {
		let oidcProviderConfigInForm = form["oidc_provider_configuration"];
		if(oidcProviderConfigInForm["isNew"] == "true") {
			if(isValidOIDCURL(oidcProviderConfigInForm) == -1) return null;

			let oidcProviderConfigGR = new GlideRecord("oidc_provider_configuration");
			oidcProviderConfigGR.newRecord();
			for(let key in oidcProviderConfigInForm) {
				if(key == "_row_data" || key == "sys_id" || key == "isSame" || key == "isNew") continue;
				oidcProviderConfigGR.setValue(key, oidcProviderConfigInForm[key]);
			}
			return oidcProviderConfigGR.insert();
		} else {
			if(oidcProviderConfigInForm["isSame"] != "true") {
				if(isValidOIDCURL(oidcProviderConfigInForm) == -1) return null;

				let oidcProviderConfigGR = new GlideRecord("oidc_provider_configuration");
				oidcProviderConfigGR.get(oidcProviderConfigInForm["sys_id"]);

				if(!oidcProviderConfigGR.isValid()) return null;

				for(let key in oidcProviderConfigInForm) {
					if(key == "_row_data" || key == "sys_id" || key == "isSame" || key == "isNew") continue;
					oidcProviderConfigGR.setValue(key, oidcProviderConfigInForm[key]);
				}

				return oidcProviderConfigGR.update();
			}
		}
		return oidcProviderConfigInForm["sys_id"];
	}

	function updateOauthOIDCEntityRecord(tableName, recordSysId, referenceField, referenceValue) {
		if (!tableName || !recordSysId || !referenceField || !referenceValue) {
			return;
		}

		var gr = new GlideRecord(tableName);
		if (gr.get(recordSysId)) { // Fetch record by sys_id
			gr.setValue(referenceField, referenceValue); // Update reference field
			gr.update(); 
			gs.info('Record updated successfully in table: ' + tableName);
		}
	}

	function upsertRecordInOIDCProviderConfigurationTable(data) {
		var gr = new GlideRecord('oidc_provider_configuration');

		if (data.sys_id && gr.get(data.sys_id)) {
			// Record exists, update it
			for (var field in data) {
				if (field !== 'sys_id') { // Avoid updating sys_id
					gr.setValue(field, data[field]);
				}
			}
			gr.update();
			return gr.sys_id.toString();
		} 
		else {
			// Record doesn't exist, create a new one
			gr.initialize();
			for (var field in data) {
				if (field !== 'sys_id') {
					gr.setValue(field, data[field]);
				}
			}
			var newSysId = gr.insert();
			return newSysId;
		}
	}

	function createInboundIntegrationProviderRegistry(oauthEntity, providerName, entityName) {
		let integrationProviderRegistryGR = new GlideRecord("inbound_integration_provider_registry");
		integrationProviderRegistryGR.setValue("oauth_entity", oauthEntity);
		integrationProviderRegistryGR.setValue("provider_name", providerName);
		integrationProviderRegistryGR.setValue("integration_name", entityName);
		integrationProviderRegistryGR.setValue("authentication_type", "oauth");
		return integrationProviderRegistryGR.insert();
	}

	function updateInboundIntegrationProviderRegistry(oauthEntity, providerName, entityName) {
		let integrationProviderRegistryGR = new GlideRecord("inbound_integration_provider_registry");
		integrationProviderRegistryGR.get("oauth_entity", oauthEntity);
		if(integrationProviderRegistryGR.isValidRecord()) {
			integrationProviderRegistryGR.setValue("provider_name", providerName);
			integrationProviderRegistryGR.setValue("integration_name", entityName);
			return integrationProviderRegistryGR.update();
		}
		return createInboundIntegrationProviderRegistry(oauthEntity, providerName, entityName);
	}

    var response = {};
    if (!input.fieldNameAndValues || Object.keys(input.fieldNameAndValues).length == 0) {
        response["error"] = true;
        response["error_message"] = gs.getMessage("Field values cannot be empty");
        return response;
    }

	if(input.isDelete == true) {
		let deleteGR = new GlideRecordSecure(input.tableName);
		deleteGR.get(input.sysId);
        if (!deleteGR.isValid()) {
            response["error"] = true;
            response["error_message"] = gs.getMessage("Failed to find record");
            return response;
        }
		let deleteScopes = new GlideRecord("oauth_entity_auth_scope_mapping");
		deleteScopes.addQuery("oauth_entity", input.sysId);
		deleteScopes.deleteMultiple();
		
		response["delete"] = deleteGR.deleteRecord();
		if(response["delete"] == true) {
			gs.getSession().putProperty("oauth_entity_update_success", {
				"message" : gs.getMessage("Inbound Integration record deleted: {0}", deleteGR.getValue("name")),
				"type" : "delete"
			});
		}
		return response;
	}

	if (input.tableName == "oauth_entity" && input.fieldNameAndValues["login_url"] && input.fieldNameAndValues["login_url"].trim() !== "") {
        var loginValidationResult = validateLoginUrl(input.fieldNameAndValues["login_url"].trim());

        if (loginValidationResult !== "valid") {
            response["error"] = true;
            response["error_message"] = loginValidationResult;
            return response;
		}
	}

	if(!input.fieldNameAndValues["integration_registry_input"]) {
		response["error"] = true;
		response["error_message"] = gs.getMessage("Please provide 'Provider name'.");
		return response;
	}

	if(input.tableName == "oauth_jwt") {
		if(input.fieldNameAndValues.jwks_url != "") {
			let oidcProviderTester = new SNC.OIDCProviderTester();
			if(oidcProviderTester.isValidURL(input.fieldNameAndValues.jwks_url) == false) {
				response["error"] = true;
				response["error_message"] = gs.getMessage("Please provide a valid URL. HTTP protocol not allowed. Refer documentation for more details.");
				return response;
			}
		}
	}

	if (input.tableName == 'oauth_jwt' || input.tableName == 'oauth_entity') {
        if (input.fieldNameAndValues.client_secret && input.fieldNameAndValues.client_secret.length > 4096){
            response["error"] = true;
            response["error_message"] = gs.getMessage("The maximum number of characters for client secret is {0}", 4096);
            return response;
        }
    }

    if (input.isNewRecord == true) {
        let newOAuthEntityGR = new GlideRecordSecure(input.tableName);

        newOAuthEntityGR.addQuery("name", input.fieldNameAndValues["name"]);
        newOAuthEntityGR.query();
        if (newOAuthEntityGR.next()) {
            response["error"] = true;
            response["error_message"] = gs.getMessage("A record already exists with same name.");
            return response;
        }

        newOAuthEntityGR.newRecord();
		if(input.tableName == "oauth_oidc_entity")
			newOAuthEntityGR.setValue("type", "oauth_provider");
		let oidcProviderConfigSysId;
        for (let key in input.fieldNameAndValues) {
			if(key== "oidc_provider_configuration")
				oidcProviderConfigSysId = upsertRecordInOIDCProviderConfigurationTable(input.fieldNameAndValues[key]);
            if (key == 'client_secret')
                newOAuthEntityGR.setDisplayValue(key, input.fieldNameAndValues[key]);
            else
                newOAuthEntityGR.setValue(key, input.fieldNameAndValues[key]);
        }
        let newOAuthEntityGRInsertResult = newOAuthEntityGR.insert();
        if (newOAuthEntityGRInsertResult == null) {
            response["error"] = true;
            response["error_message"] = gs.getMessage("Failed to update the record");
            let lastErrorReason = gr.getLastErrorMessage();
            if (gr.getLastErrorMessage() != null) {
                response["error_message"] = gs.getMessage("Failed to update the record. {0}", lastErrorReason);
            }
            return response;
        }

		let registry = createInboundIntegrationProviderRegistry(newOAuthEntityGRInsertResult, input.fieldNameAndValues["integration_registry_input"], input.fieldNameAndValues["name"]);
		if(!registry) {
			response["error"] = true;
			response["error_message"] = gs.getMessage("Failed to save Integration Provider Registry record.");
			return response;
		}

		if(oidcProviderConfigSysId)
			updateOauthOIDCEntityRecord('oauth_oidc_entity', newOAuthEntityGR.getValue("sys_id"),'oidc_provider_configuration', oidcProviderConfigSysId);

        createScopesAndAPIs(newOAuthEntityGR.getValue("sys_id"), input.fieldNameAndValues.scopesAndAPIs);

		gs.getSession().putProperty("oauth_entity_update_success", {
            "message" : gs.getMessage("New Inbound Integration record created: {0}", newOAuthEntityGR.getValue("name")),
            "type" : "create"
        });

        response["success"] = true;
        response["sys_id"] = newOAuthEntityGR.getValue("sys_id");
    } else {
        var gr = new GlideRecordSecure(input.tableName);
        gr.get(input.sysId);
        if (!gr.isValid()) {
            response["error"] = true;
            response["error_message"] = gs.getMessage("Failed to find record");
            return response;
        }

        if (!isRecordNameUnique(input.sysId)) {
            response["error"] = true;
            response["error_message"] = gs.getMessage("A record already exists with same name.");
            return response;
        }
		if(input.tableName == "oauth_oidc_entity") {
			let shouldUpdateOIDCEntity = updateOAuthOIDCEntity(gr, input.fieldNameAndValues);
			if(shouldUpdateOIDCEntity == null) {
				response["error"] = true;
				response["error_message"] = gs.getMessage("OIDC Name / Metadata URL specified either already exists or URL cannot be reached. Please validate the configuration.");
				return response;
			}
			// For oauth_oidc_entity edit record input.fieldNameAndValues has other fields as well, to limit the update to only the fields required for oauth_oidc_entity, defined the fields here.
			let oauthOIDCEntityFields = ["active", "client_id", "name", "oidc_provider_configuration", "comments", "scope_restriction_status"];
			for (let key in input.fieldNameAndValues) {
				if(oauthOIDCEntityFields.indexOf(key) == -1) continue;
				if(key == "oidc_provider_configuration")
					gr.setValue(key, shouldUpdateOIDCEntity);
				else
					gr.setValue(key, input.fieldNameAndValues[key]);
			}
		} else {
			for (var field in input.fieldNameAndValues) {
				var valueToSet = input.fieldNameAndValues[field];
				if (field == 'client_secret')
					gr.setDisplayValue(field, valueToSet);
				else if (field == 'token_format' && valueToSet == 'jwt') {
					// check if this entity should be restricted to change the token format
					var isMobileClient = (gr.getValue('mobile_client') == '1' || gr.getValue('mobile_client') == 'true');
					if (isMobileClient) {
						response["error"] = true;
            			response["error_message"] = gs.getMessage("Changing the token format from Opaque to JWT is not supported for this OAuth client. Please refer to the documentation for more details.");
            			return response;
					}
					gr.setValue(field, valueToSet);
				}else
					gr.setValue(field, valueToSet);
			}
		}
		var result = gr.update();

        if (result == null) {
            response["error"] = true;
            response["error_message"] = gs.getMessage("Failed to update the record");
            var errorReason = gr.getLastErrorMessage();
            if (gr.getLastErrorMessage() != null) {
                response["error_message"] = gs.getMessage("Failed to update the record. {0}", errorReason);
            }
            return response;
        }

		let registry = updateInboundIntegrationProviderRegistry(result, input.fieldNameAndValues["integration_registry_input"], input.fieldNameAndValues["name"]);
		if(!registry) {
			response["error"] = true;
			response["error_message"] = gs.getMessage("Failed to save Integration Provider Registry record.");
			return response;
		}

        createScopesAndAPIs(input.sysId, input.fieldNameAndValues.scopesAndAPIs);

		gs.getSession().putProperty("oauth_entity_update_success", {
            "message" : gs.getMessage("Inbound Integration record updated: {0}", gr.getValue("name")),
            "type" : "update"
        });

        response["success"] = true;
    }
    return response;
}
