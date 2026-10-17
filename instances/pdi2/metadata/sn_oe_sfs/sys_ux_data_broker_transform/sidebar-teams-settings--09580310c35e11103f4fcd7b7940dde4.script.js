function transform(input) {
	var result = {};
	var sidebar_teams_config = {};
	var sys_cs_collab_channel = {};
	var sys_cs_collab_provider = {};
	var sys_cs_collab_provider_application = {};
	var collab_chat_webhook_registry = {};
	var sys_cs_collab_settings = {};
	var oAuthEntity = {};
	var wrongScope = false;
	var readOnly = false;
	var setupStatus = "incomplete";
	var isTeamsConfigured = false;
	var isTeamsEnabled = false;
		
	
	sidebar_teams_config.sys_cs_collab_channel = sys_cs_collab_channel;
	sidebar_teams_config.sys_cs_collab_provider = sys_cs_collab_provider;
	sidebar_teams_config.sys_cs_collab_provider_application = sys_cs_collab_provider_application;	
	sidebar_teams_config.oAuthEntity = oAuthEntity;
	sidebar_teams_config.sys_cs_collab_settings = sys_cs_collab_settings;
	sidebar_teams_config.collab_chat_webhook_registry = collab_chat_webhook_registry;
	result.sidebar_teams_config = sidebar_teams_config;
	result.setupStatus = setupStatus;
	result.isTeamsConfigured = isTeamsConfigured;
	result.wrongScope = wrongScope;
	
	
	////////////////////////////////////////////////////////////////////////////////////////
	// query for oauth_entity to get client secret                                        //
	////////////////////////////////////////////////////////////////////////////////////////
	var oAuthGr = new GlideRecord('oauth_entity');
	oAuthGr.addQuery('name', 'Sidebar Microsoft Teams Graph');
	oAuthGr.query();
	
	if(!oAuthGr.next()){
		result.error = gs.getMessage('We’re unable to pull up the Sidebar Microsoft Teams Graph oauth_entity record. Please contact technical support for details.');
		result.readOnly = true;
		return result;
	}
	
	oAuthEntity.client_secret = oAuthGr.getValue('client_secret');
	oAuthEntity.sys_id = oAuthGr.getUniqueValue();
	sidebar_teams_config.oAuthEntity = oAuthEntity;
	
	
	////////////////////////////////////////////////////////////////////////////////////////
	// query for sys_cs_collab_channel                                                    //
	////////////////////////////////////////////////////////////////////////////////////////
	
	var channelGr = new GlideRecord("sys_cs_collab_channel"); 
	channelGr.addQuery("name", "Teams");
	channelGr.query();
	
	if(!channelGr.next()) {
		result.error = gs.getMessage('Unable to fetch sys_cs_collab_channel record for Teams. Contact system administrator for details');
		result.readOnly = true;
		return result;
	}
	sys_cs_collab_channel.sys_id = channelGr.getUniqueValue();
	sidebar_teams_config.sys_cs_collab_channel = sys_cs_collab_channel;
	
	////////////////////////////////////////////////////////////////////////////////////////
	// query for sys_cs_collab_provider                                                   //
	////////////////////////////////////////////////////////////////////////////////////////
	var providerGr = new GlideRecord('sys_cs_collab_provider');
	providerGr.addQuery('channel', sys_cs_collab_channel.sys_id);
	providerGr.query();
	
	if(!providerGr.next()){
			result.error = gs.getMessage('Unable to fetch sys_cs_collab_provider record for Teams. Contact system administrator for details');
			result.readOnly = true;
			return result;
	}
	sys_cs_collab_provider.sys_id =  providerGr.getUniqueValue();
	sidebar_teams_config.sys_cs_collab_provider = sys_cs_collab_provider;

	
	////////////////////////////////////////////////////////////////////////////////////////
	// query for sys_cs_collab_provider_application                                       //
	////////////////////////////////////////////////////////////////////////////////////////	
	
	var applicationGr = new GlideRecord('sys_cs_collab_provider_application');
	applicationGr.addQuery('provider', sys_cs_collab_provider.sys_id);
	applicationGr.addActiveQuery();
	applicationGr.query();
	
	if(applicationGr.next()){
		for (var key in applicationGr) {
			if(key != 'sys_meta')
				sys_cs_collab_provider_application[key] = applicationGr.getValue(key);
		}
		
		setupStatus = sys_cs_collab_provider_application.setup_status;
		if(setupStatus == "incomplete"){ //users are being imported
			readOnly = true;
		}
		isTeamsConfigured = true;
		sidebar_teams_config.sys_cs_collab_provider_application = sys_cs_collab_provider_application;	
		
		if (!applicationGr.canWrite() && !isInSelectedScope(applicationGr)) {
			wrongScope = true;
		}
	}
	
	////////////////////////////////////////////////////////////////////////////////////////
	// query for webhook registry and call back URL                                       //
	////////////////////////////////////////////////////////////////////////////////////////	
	
	var webhookGr = new GlideRecord("sys_cs_collab_chat_webhook_registry");
	webhookGr.addQuery("name", "CollabChatWebhookRegistry");
	webhookGr.query();
	if(webhookGr.next()) {
		if (!webhookGr.canWrite() && !webhookGr.canWrite()) {
			wrongScope = true;
		}
		collab_chat_webhook_registry.callback_url = webhookGr.getValue("callback_url");
		collab_chat_webhook_registry.sys_id = webhookGr.getUniqueValue();
		sidebar_teams_config.collab_chat_webhook_registry = collab_chat_webhook_registry;
	} else {
		result.error = gs.getMessage('We’re unable to pull up the collab_chat_webhook_registry record. Please contact technical support for details.');
		result.readOnly = true;
		return result;
	}
	
	////////////////////////////////////////////////////////////////////////////////////////
	// query for sys_cs_collab_settings.                                                  //
	////////////////////////////////////////////////////////////////////////////////////////	
	
	var settingsGr = new GlideRecord("sys_cs_collab_settings");
	settingsGr.query();
	if(settingsGr.next()) {
		if (!settingsGr.canWrite() && !settingsGr.canWrite()) {
			wrongScope = true;
		}
		sys_cs_collab_settings = {};
		sys_cs_collab_settings.sys_id = settingsGr.getUniqueValue();
		isTeamsEnabled = settingsGr.getValue('enable_teams') == 1;
		preferenceChannel = settingsGr.getValue('preference_channel');
		sidebar_teams_config.sys_cs_collab_settings = sys_cs_collab_settings;

	} else {
		result.error = gs.getMessage('Unable to fetch sys_cs_collab_settings record. Contact system administrator for details');
		result.readOnly = true;
		return result;
	}
	
	if(wrongScope) {
		var expectedScope = settingsGr.getDisplayValue('sys_scope') || 'Omni-Experience Standard Feature Set';
			result.crossScopeMessage = gs.getMessage('This page can only be edited when {0} is the current application. Change the scope to make any updates.', '<strong>' + expectedScope + '</strong>');
		readOnly = true;
	}

	result.wrongScope = wrongScope;
	result.readOnly = readOnly;
	result.sidebar_teams_config = sidebar_teams_config;
	result.setupStatus = setupStatus;
	result.isTeamsConfigured = isTeamsConfigured;
	result.isTeamsEnabled = isTeamsEnabled;
	result.preferenceChannel = preferenceChannel;
	return result;


	function isInSelectedScope(gr) {
		var currentScope = gs.getCurrentScopeName();
		var grScope = gr.getValue('sys_scope');
		return currentScope == grScope;
	}
}
