(function process(/*ResolverEnvironment*/ env) {
	var result = {};
	var inputData = env.getArguments().parameters;
	var providerId;
	var parsedData = {};
	var reimportUsers = false;
	
	for(val in inputData) {
		var input = inputData[val];
		var fields = {};
		var entry = {};
		
		if(parsedData[input.name]) {
			entry = parsedData[input.name];
			fields = entry['fields'];
		}
		
		entry['sys_id'] = input.sysId;
		var field = input.field;
		fields[field] = input.value;
		entry['fields'] = fields;
		parsedData[input.name] = entry;
	}
	//TODO: move all the record updates into a for loop maintainability and reusability
	
	var providerApplicationGr = new GlideRecord("sys_cs_collab_provider_application"); //update redirect_url and app_id
	if(providerApplicationGr.get(parsedData["sys_cs_collab_provider_application"].sys_id)) {
		var fields = parsedData["sys_cs_collab_provider_application"].fields;
		for(field in fields) {
			providerApplicationGr.setValue(field, fields[field]);
			if(fields[field] == "error") {
                reimportUsers = true;
                providerApplicationGr.setValue(field, "incomplete");
            }
		}
		
		if(!providerApplicationGr.update()) {
			result.message = gs.getMessage("We’re unable to update the sys_cs_collab_provider_application record. Please contact technical support for details.");
		result.success = false;
		return result;
		}
		
	} else {
		result.message = gs.getMessage("Unable to fetch sys_cs_collab_provider_application record for Teams. Contact system administrator for details");
		result.success = false;
		return result;
	}
	
	
	var settingsGr = new GlideRecord("sys_cs_collab_settings"); //update enabl_teams
	if(settingsGr.get(parsedData["sys_cs_collab_settings"].sys_id)) {
		var fields = parsedData["sys_cs_collab_settings"].fields;
		for(field in fields) {
			settingsGr.setValue(field, fields[field]);
		}
		
		if(!settingsGr.update()) {
			result.message = gs.getMessage("We’re unable to update the sys_cs_collab_settings record. Please contact technical support for details.");
			result.success = false;
			return result;
		}
	} else {
		result.message = gs.getMessage("Unable to fetch sys_cs_collab_settings record for Teams. Contact system administrator for details");
		result.success = false;
		return result;
	}
	
	
	var webhookGr = new GlideRecord("sys_cs_collab_chat_webhook_registry"); // update callback_url
	if(webhookGr.get(parsedData["collab_chat_webhook_registry"].sys_id)) {
		var fields = parsedData["collab_chat_webhook_registry"].fields;
		for(field in fields) {
			webhookGr.setValue(field, fields[field]);
		}
		
		if(!webhookGr.update()) {
			result.message = gs.getMessage("We’re unable to update the collab_chat_webhook_registry record. Please contact technical support for details.");
			result.success = false;
			return result;
		}
	} else {
		result.message = gs.getMessage("Unable to fetch collab_chat_webhook_registry record for Teams. Contact system administrator for details");
		result.success = false;
		return result;
	}
	
	var oAuthEntityGr = new GlideRecord("oauth_entity"); //update client_secret
	if(oAuthEntityGr.get(parsedData["oauth_entity"].sys_id)) {
		var fields = parsedData["oauth_entity"].fields;
		for(field in fields) {
			oAuthEntityGr.setValue(field, fields[field]);
		}
		
		if(!oAuthEntityGr.update()) {
			result.message = gs.getMessage("We’re unable to update the oauth_entity record. Please contact technical support for details.");
			result.success = false;
			return result;
		}
		
	} else {
		result.message = gs.getMessage("Unable to fetch oauth_entity record for Teams. Contact system administrator for details");
		result.success = false;
		return result;
	}
	
	
	////////////////////////////////////////////////////////////////////////////////////////
	// generate new OAuth Token                                                           //
	////////////////////////////////////////////////////////////////////////////////////////
	var tokenGenerated = false;
	var oAuthProfileGr = new GlideRecord('oauth_entity_profile');
	oAuthProfileGr.addQuery('oauth_entity', parsedData["oauth_entity"].sys_id);
	oAuthProfileGr.query();
	
	if(oAuthProfileGr.next()) {
		var oAuthProfileSysId = oAuthProfileGr.getUniqueValue();
		var oAuthCredentialGr = new GlideRecord('oauth_2_0_credentials');
		oAuthCredentialGr.addQuery('oauth_entity_profile', oAuthProfileSysId);
		oAuthCredentialGr.addQuery('name', 'Sidebar - Teams Credentials');
		oAuthCredentialGr.query();
		if(oAuthCredentialGr.next()) {
			var oAuthCredentialSysId = oAuthCredentialGr.getUniqueValue();
			// request the admin setting oauth token
			tokenGenerated = requestAdminOAuthToken('oauth_2_0_credentials', oAuthCredentialSysId, false, oAuthProfileSysId, null);
		} else {
			tokenGenerated = false;
		}
	} else {
		tokenGenerated = false;
	}
	
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	//Settings saved, failed to generate token
	if(!tokenGenerated) {
		return failedToGenerateAuthToken();
	}

	if(reimportUsers) {
		importUsers();
	}
	
	//Everything Successfull
	result.message = gs.getMessage("Success! Your changes have been saved.");
	result.success = true;
	return result;
	
	function failedToGenerateAuthToken() {
		result = {};
		result.success = false;
		result.message=  gs.getMessage("We’ve run into a technical issue. Please check your entries and try again.");
		return result;
	}

	function importUsers() {
        var jobGr = new GlideRecord("sysauto_script");
        if (jobGr.get('206c86fcc32211100f24c87af040ddf1')) {
            new global.CollabChatGlobalUtils().executeScheduledJob(jobGr);
        } else {
            result = {};
            result.success = false;
            result.message = gs.getMessage('We’re unable to pull up the Teams user auto syncing job. Please contact technical support for details.');
            return result;
        }
    }
	
	//script to generate new oAuth token
	function requestAdminOAuthToken(requestor_context, requestor, personal, oauth_provider_profile, oauth_provider_id) {
		var tokenRequest = new sn_auth.GlideOAuthClientRequest();
		tokenRequest.setParameter('oauth_requestor_context', requestor_context);
		tokenRequest.setParameter('oauth_requestor', requestor);
		tokenRequest.setParameter('personal', personal);
		tokenRequest.setParameter('oauth_provider_profile', oauth_provider_profile);
		tokenRequest.setParameter('oauth_provider_id', oauth_provider_id);
		var oAuthClient = new  sn_auth.GlideOAuthClient();
		var tokenResponse = oAuthClient.requestTokenByRequest(null, tokenRequest);
		var errorMsg = tokenResponse.getErrorMessage();
		var flowName = 'client_credentials';
		
		if(errorMsg) {	
			gs.info('OAuth authentication failed for ' + flowName + ' grant type flow');
			return false;
		}
		if (tokenResponse) {
			var token = tokenResponse.getToken();
			
			if(token) {
				if(token.getAccessToken()) {
					gs.info("Successfully obtained OAuth token");
					return true;
				}
			}
		}
		
		gs.info('OAuth authentication failed for '+ flowName + ' grant type flow');
		return false;
	}

})(env);
