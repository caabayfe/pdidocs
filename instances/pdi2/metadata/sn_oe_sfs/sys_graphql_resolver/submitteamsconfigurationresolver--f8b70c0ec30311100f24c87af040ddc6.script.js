(function process(/*ResolverEnvironment*/ env) {
	var inputData = env.getArguments().parameters;
	var providerId;
	var application_id = "";
	var directory_id = "";
	var teams_app_id = "";
	var client_secret = "";
	var callback_url = "";
	var redirect_url = "";
	for(val in inputData) {
		var input = inputData[val];
		switch (input.field) {
			case "app_id":
				teams_app_id = input.value;
				break;
			case "redirect_url":
				redirect_url = input.value;
				break;
			case "callback_url":
				callback_url = input.value;
				break;
			case "directory_id":
				directory_id = input.value;
				break;
			case "application_id":
				application_id = input.value;
				break;
			case "client_secret":
				client_secret = input.value;
				break;
			case "provider_id":
				providerId = input.value;
				break;
			default:
		}
	}

	var authUrl = 'https://login.microsoftonline.com/'+directory_id+'/oauth2/v2.0/authorize';
	var tokenUrl = 'https://login.microsoftonline.com/'+directory_id+'/oauth2/v2.0/token';
	var oAuthProviderSysId;
	var oAuthProfileSysId;
	var oAuthCredentialSysId;
	var aliasSysId;
	var adminConnection;
	var result = {};
		
	var requiredInputsFilled = application_id && directory_id && teams_app_id && client_secret && callback_url;

	if(!requiredInputsFilled){
		result.message =  gs.getMessage('We’re missing some required fields.');
		result.success = false;
		result.errorType = "error";
		gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
		return result;
	}
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var webhookGr = new GlideRecord("sys_cs_collab_chat_webhook_registry");
		webhookGr.addQuery("name", "CollabChatWebhookRegistry");
		webhookGr.query();
	if(webhookGr.next()) {
		if (!webhookGr.canWrite() && !webhookGr.canWrite()) {
			wrongScope = true;
		}
		webhookGr.setValue('callback_url', callback_url);
		webhookGr.update();
		
	} else {
		result.message = gs.getMessage('We’re unable to pull up the collab_chat_webhook_registry record. Please contact technical support for details.');
		result.success = false;
		result.errorType = "error";
		return result;
	}
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	var oAuthGr = new GlideRecord('oauth_entity');
	oAuthGr.addQuery('name', 'Sidebar Microsoft Teams Graph');
	oAuthGr.query();
	
	if(oAuthGr.next()) {	
		if(!oAuthGr.canWrite() && !isInSelectedScope(oAuthGr)){
			result.success = false;
			gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
			var expectedScope = oAuthGr.getDisplayValue('sys_scope') || 'Omni-Experience Standard Feature Set';
			result.message = gs.getMessage('This page can only be edited when {0} is the current application. Change the scope to make any updates.', '<strong>' + expectedScope + '</strong>');
			result.errorType = "crossScopeMessage";
			return result;
		}
		
		oAuthProviderSysId = oAuthGr.getUniqueValue();
		oAuthGr.setValue('client_secret', client_secret);
		oAuthGr.setValue('client_id', application_id);		
		oAuthGr.setValue('auth_url', authUrl);
		oAuthGr.setValue('token_url', tokenUrl);
		oAuthGr.update();
	} else {
		result.message = gs.getMessage('We’re unable to pull up the Sidebar Microsoft Teams Graph oauth_entity record. Please contact technical support for details.');
		result.success = false;
		result.errorType = "error";
		gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
		return result;
	}
	
	var oAuthProfileGr = new GlideRecord('oauth_entity_profile');
	oAuthProfileGr.addQuery('oauth_entity', oAuthProviderSysId);
	oAuthProfileGr.query();
	if(oAuthProfileGr.next()){
		oAuthProfileSysId = oAuthProfileGr.getUniqueValue();
		result.oAuthProfileSysId = oAuthProfileSysId;
	} else {
		result.message = gs.getMessage('Unable to fetch oauth_entity_profile record. Contact system administrator for details');
		result.success = false;
		result.errorType = "error";
		gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
		return result; 
	}
	
	var oAuthCredentialGr = new GlideRecord('oauth_2_0_credentials');
	oAuthCredentialGr.addQuery('oauth_entity_profile', oAuthProfileSysId);
	oAuthCredentialGr.addQuery('name', 'Sidebar - Teams Credentials');
	oAuthCredentialGr.query();

	if(oAuthCredentialGr.next()) {
		oAuthCredentialSysId = oAuthCredentialGr.getUniqueValue();
		result.oAuthCredentialSysId = oAuthCredentialSysId;
	} else {
		result.message = gs.getMessage('We’re unable to pull up the oauth_2_0_credentials record. Please contact technical support for details.');
		result.success = false;
		result.errorType = "error";
		gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
		return result; 
	}
	
	var aliasGr = new GlideRecord('sys_alias');
	aliasGr.addQuery('id', 'sn_oe_sfs.Sidebar_Teams_Graph_Credentials');
	aliasGr.query();
	
	if(aliasGr.next()) {
		aliasSysId =  aliasGr.getUniqueValue();
		result.aliasSysId = aliasSysId;
	} else {
		result.message = gs.getMessage('We’re unable to pull up the sys_alis record. Please contact technical support for details.');
		result.success = false;
		result.errorType = "error";
		gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
		return result;
	}	
	
	var connectionGr = new GlideRecord('http_connection');
	connectionGr.addQuery('connection_alias', aliasSysId);
	connectionGr.addQuery('credential', oAuthCredentialSysId);
	connectionGr.query();
	
	if(connectionGr.next()) {
		adminConnection = connectionGr.getUniqueValue();
		result.adminConnection = adminConnection;
	} else {
		result.message = gs.getMessage('We’re unable to pull up the http_connection record. Please contact technical support for details.');
		result.success = false;
		result.errorType = "error";
		gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
		return result;
	}
	if (!checkAndGenerateEncryptionKey()) {
		result.message = gs.getMessage('Cannot generate encryption key. Please contact technical support for details.');
		result.success = false;
		result.errorType = "error";
		gs.eventQueue('sidebar.teams.setup.failure', null, gs.getUser().getEmail(), "");
		return result;
	}

	var applicationGr = new GlideRecord("sys_cs_collab_provider_application");
	applicationGr.name = 'Teams Application';
	applicationGr.provider = providerId;
	applicationGr.admin_connection = adminConnection;
	applicationGr.active = true;
	applicationGr.app_id = teams_app_id;
	applicationGr.application_id = application_id;
	applicationGr.directory_id = directory_id;
	applicationGr.redirect_url = redirect_url;
	applicationGr.oauth_scopes = 'openid,Chat.Create,Chat.ReadWrite,ChatMember.ReadWrite, offline_access';
	applicationGr.setup_status = "incomplete";
	var success = applicationGr.insert();
	if(success){
		//request the admin setting oauth token
        var tokenGenerated = requestAdminOAuthToken('oauth_2_0_credentials', oAuthCredentialGr.getUniqueValue(), false, oAuthCredentialGr.getValue('oauth_entity_profile'), null);
        if(!tokenGenerated) {
            result.success = false;
			result.errorType = "error";
            result.message = gs.getMessage('We’ve run into a technical issue. Please check your entries and try again.');
            applicationGr = new GlideRecord("sys_cs_collab_provider_application");
			applicationGr.get(success);
			applicationGr.deleteRecord();
            return result;
        }

        //Execute scheduled script job async
        var jobGr = new GlideRecord("sysauto_script");
        if (jobGr.get('206c86fcc32211100f24c87af040ddf1')) {
            new global.CollabChatGlobalUtils().executeScheduledJob(jobGr);
        } else {
            result.success = false;
			result.errorType = "error";
            result.message = gs.getMessage('We’re unable to pull up the Teams user auto syncing job. Please contact technical support for details.');
            applicationGr = new GlideRecord("sys_cs_collab_provider_application");
			applicationGr.get(success);
			applicationGr.deleteRecord();
            return result;
        }

        result.success = true;
        return result;
	} else {
		result.message = gs.getMessage('We’ve run into a technical issue. Please check your entries and try again.');
		result.success = false;
		result.errorType = "error";
		applicationGr = new GlideRecord("sys_cs_collab_provider_application");
		applicationGr.get(success);
		applicationGr.deleteRecord();
		return result;
	}
	
	function isInSelectedScope(gr) {
		var currentScope = gs.getCurrentScopeName();
		var grScope = gr.getValue('sys_scope');
		return currentScope == grScope;
	}
	
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
	function checkAndGenerateEncryptionKey() {
		var cryptoModuleSpecId = '9046791f536811101c1addeeff7b12d0';
		var cryptoModuleName = 'sn_oe_sfs.ms_teams_crypto';
		var cryptoSpec = new GlideRecord('sys_kmf_module_crypto_spec');
		if (!cryptoSpec.get(cryptoModuleSpecId)) {
			gs.error('No module crypto spec found');
			return false;
		}
		var cryptoPurpose = '' + cryptoSpec.crypto_purpose;
		var publicKeyType;
		var certificateName;
		if (cryptoPurpose === '01190877c7103300af4d43c6f0976339') {
			publicKeyType = '13e0503bc7103300af4d43c6f09763f0'; //public key wrapping key
			certificateName = cryptoModuleName + '_publickeywrap';
		} else {
			gs.error('Unsupported crypto purpose');
			return false;
		}
		var moduleKey = queryModuleKey(publicKeyType);
		if (!moduleKey.next()) {
			new sn_kmf.KMFUtil().generateModuleKey(cryptoModuleSpecId);
			moduleKey = queryModuleKey(publicKeyType);
			if (!moduleKey.next()) {
				gs.error('Cannot generate key pair');
				return false;
			}
		}
		return checkAndGenerateCertificate(certificateName, moduleKey.sys_id);
	}
	function checkAndGenerateCertificate(certificateName, publicKeyId) {
		var gr = new GlideRecord('sys_certificate');
		gr.addQuery('name', certificateName);
		gr.query();
		if (!gr.next()) {
			try {
				return new CollabChatUtils().exportPublicKeyToCertificate(publicKeyId, '.pem');
			} catch (error) {
				gs.error('Cannot generate certificate');
				return false;
			}
		}
		return gr.format + '' === 'pem';
	}
	function queryModuleKey(publicKeyType) {
		var moduleKey = new GlideRecord('sys_kmf_module_key');
		moduleKey.addQuery('crypto_module', '3b16f51f536811101c1addeeff7b1209');
		moduleKey.addQuery('key_lifecycle_state', 'IN', 'active,renewed');
		moduleKey.addQuery('key_type', publicKeyType);
		moduleKey.query();
		return moduleKey;
	}

})(env);
