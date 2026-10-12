var CollabSlackUtil = Class.create();
CollabSlackUtil.prototype = {
    initialize: function() {
    },
	getInstanceName: function() {
		return gs.getProperty('glide.servlet.uri');
	},
	getCollabProviderApp: function() {
		var currentDomain = gs.getSession().getCurrentDomainID() ?? 'global';
		var result = {};
		var slackProviderSysId = "1f2e35d1a3f382106cdec213d51e61ae";
		var botOAuthEntitySysId = "0fd80c95a30452106cdec213d51e61bd";

		var gr = new GlideRecord('sys_cs_collab_provider_application');
		gr.addActiveQuery();
		gr.addQuery('sys_domain', currentDomain);
		gr.addQuery('provider', slackProviderSysId);
		gr.query();
		if (gr.next()) {
			var status = gr.getValue('setup_status');
			if (status === 'complete') {
				result.readOnly = true;
				result.isSlackConfigured = true;
			}
			else {
				result.readOnly = false;
				result.isSlackConfigured = false;
			}
			result.clientId = gr.getValue('application_id');
			result.signingSecret = gr.signing_secret.getDecryptedValue();
		} else {
			result.readOnly = false;
			result.isSlackConfigured = false;
		}
		result.clientSecret = this.__getClientSecret();
		result.botUserOauthToken = this.__getBotUserOAuthToken(botOAuthEntitySysId);

		return result;
	},
	saveConfig: function(credentials, isSlackEnabled) {
		var response = {};
		var success;
		//Enables Slack, disables Teams and sets preference channel to Slack
		this.__updateCollabSettings(isSlackEnabled);
		success = this.__createOrUpdateProviderApp(credentials);
		// Update client_id and client_secret for OOB records:
		// "Sidebar Slack Oauth Entity" and "Sidebar Slack OAuth User Token"
		var botOAuthEntitySysId = "0fd80c95a30452106cdec213d51e61bd";
		var userOAuthEntitySysId = "c532dcbd4f641210f1bba92723ce0ba4";
		success = this.__updateOAuthEntityRecord(botOAuthEntitySysId, credentials);
		success = this.__updateOAuthEntityRecord(userOAuthEntitySysId, credentials);

		var oauthCredentialSysId = "816c80d9a30452106cdec213d51e61cf"; // "Sidebar Slack Credentials"
		var oauthEntityProfileSysId = "4ab90cd5a30452106cdec213d51e6120"; // "Sidebar Slack Oauth Entity default_profile"
		var oAuthRequestorProfile = this.__getOrCreateOAuthRequestorProfile("oauth_2_0_credentials", oauthEntityProfileSysId, oauthCredentialSysId);
		
		success = this.__createOrUpdateBotUserOAuthToken(credentials.botUserOauthToken, botOAuthEntitySysId, oAuthRequestorProfile);

		if (success) {
			response.status = 200;
			response.body = {
				message: gs.getMessage('Success! Your changes have been saved.'),
				error: false
			};
		} else {
			response.status = 500;
			response.body = {
				message: gs.getMessage('Failed! Your changes have not been saved.'),
				error: true
			};
		}
		return response;
	},
	__updateOAuthEntityRecord: function(sys_id, credentials) {
		var oauthEntityGr = new GlideRecord('oauth_entity');
		var redirectUrl = this.getInstanceName() + 'oauth_redirect.do';
		oauthEntityGr.addActiveQuery();
		if (oauthEntityGr.get(sys_id)) {
			oauthEntityGr.client_id = credentials.clientId;
			oauthEntityGr.getElement('client_secret').setDisplayValue(credentials.clientSecret);
			oauthEntityGr.setValue('redirect_url', redirectUrl);
			return oauthEntityGr.update();
		}
	},
	__getOrCreateOAuthRequestorProfile: function(requestorContext, oauthEntityProfileId, requestorId) {
		var gr = new GlideRecord('oauth_requestor_profile');
		gr.addQuery('requestor_context', requestorContext);
		gr.addQuery('oauth_entity_profile', oauthEntityProfileId);
		gr.addQuery('requestor_id', requestorId);
		gr.setLimit(1);
		gr.query();
		
		if (gr.next()) {
			return gr.getUniqueValue();
		} else {
			gr.oauth_entity_profile = oauthEntityProfileId;
			gr.requestor_context = requestorContext;
			gr.requestor_id = requestorId;
			gr.personal = false;
			return gr.insert();
		}
	},
	__createOrUpdateBotUserOAuthToken: function(botUserOauthToken, oAuthEntitySysId, oAuthRequestorProfile) {
		var expiry = new GlideDateTime();
		expiry.addMonthsLocalTime(2);

		var oauthCredGr = new GlideRecord('oauth_credential');
		oauthCredGr.addQuery('peer', oAuthEntitySysId);
		oauthCredGr.addQuery('oauth_requestor_profile', oAuthRequestorProfile);
		oauthCredGr.addQuery('type', 'access_token');
		oauthCredGr.query();
		if (oauthCredGr.next()) {
			oauthCredGr.setValue('token_received', botUserOauthToken);
			oauthCredGr.setValue('expires', expiry);
			return oauthCredGr.update();
		} else {
			oauthCredGr.name = "Sidebar Slack Oauth Entity";
			oauthCredGr.type = "access_token";
			oauthCredGr.peer = oAuthEntitySysId;
			oauthCredGr.oauth_requestor_profile = oAuthRequestorProfile;
			oauthCredGr.setValue('token_received', botUserOauthToken);
			oauthCredGr.setValue('expires', expiry);
			oauthCredGr.scopes = "user:read, user:read.email";
			oauthCredGr.user = gs.getUserID();
			return oauthCredGr.insert();
		}
	},
	deleteConfig: function() {
		var currentDomain = gs.getSession().getCurrentDomainID() ?? 'global';
		var gr = new GlideRecord('sys_cs_collab_provider_application');
		gr.addActiveQuery();
		gr.addQuery('sys_domain', currentDomain);
		gr.addQuery('provider', '1f2e35d1a3f382106cdec213d51e61ae'); // Slack Provider
		gr.query();
		if (gr.next()) {
			gr.deleteRecord();
		}
		var response = {};
		response.status = 200;
		response.body = {
			message: gs.getMessage('Success! Slack Integration has been removed.'),
			error: false
		};
		return response;
	},
	__getBotUserOAuthToken: function(botOAuthEntitySysId) {
		var oauthCredGr = new GlideRecord('oauth_credential');
		oauthCredGr.addQuery('peer', botOAuthEntitySysId);
		oauthCredGr.addQuery('type', 'access_token');
		oauthCredGr.query();
		if (oauthCredGr.next())
			return oauthCredGr.getValue('token_received');
	},
	__getClientSecret: function() {
		var oauthEntityGr = new GlideRecord('oauth_entity');
		oauthEntityGr.addActiveQuery();
		oauthEntityGr.addQuery('name', 'Sidebar Slack Oauth Entity');
		oauthEntityGr.query();
		if (oauthEntityGr.next())
			return oauthEntityGr.client_secret.getDecryptedValue();
	},
	__updateCollabSettings: function(isSlackEnabled) {
		var collabSettingsGr = new GlideRecord('sys_cs_collab_settings');
		collabSettingsGr.query();
		if (collabSettingsGr.next()) {
			collabSettingsGr.setValue('enable_slack', isSlackEnabled);
			if (isSlackEnabled)
				collabSettingsGr.setValue('enable_teams', false);
				
			collabSettingsGr.setValue('preference_channel', "a2db3911a3f382106cdec213d51e6181"); //slack collab channel
			collabSettingsGr.update();
		}
	},
	__createOrUpdateProviderApp: function(credentials) {
		var currentDomain = gs.getSession().getCurrentDomainID() ?? 'global';
		var gr = new GlideRecord('sys_cs_collab_provider_application');
		gr.addActiveQuery();
		gr.addQuery('sys_domain', currentDomain);
		gr.addQuery('provider', '1f2e35d1a3f382106cdec213d51e61ae'); // Slack Provider
		gr.query();
		if (!gr.next()) {
			gr.name = "Slack Application";
			gr.active = true;
			gr.application_id = credentials.clientId;
			gr.provider = '1f2e35d1a3f382106cdec213d51e61ae';
			gr.getElement('signing_secret').setDisplayValue(credentials.signingSecret);
			gr.sys_domain = currentDomain;
			gr.setup_status = "incomplete";
			return gr.insert();
		} else {
			gr.application_id = credentials.clientId;
			gr.getElement('signing_secret').setDisplayValue(credentials.signingSecret);
			return gr.update();
		}
	},
	activateAndExecuteSlackSchdlJob: function() {
		var globalUtil = new global.CollabChatGlobalUtils();
		var scheduledJobGr = new GlideRecord('sysauto_script');
		scheduledJobGr.addQuery('name', 'Slack Users Auto Syncing');
		scheduledJobGr.query();
		if (scheduledJobGr.next()) {
			scheduledJobGr.setValue('active', true);
			scheduledJobGr.update();
			globalUtil.executeScheduledJob(scheduledJobGr);
		}
	},
    type: 'CollabSlackUtil'
};
