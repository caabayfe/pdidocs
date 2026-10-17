function transform(input) {
	var result = {};
	result.sys_cs_collab_settings = {};
	var readOnly = false;
	var _chatSettings = {};
	var fields = {}; 
	var collabSettingDto = sn_collab.CollabChatScriptObject.getCollabChatSettingForCurrentDomain();
	if (collabSettingDto) {
		_chatSettings['sys_id'] = collabSettingDto.sysId;
		fields['enable_emojis'] = { value: collabSettingDto.emojisEnabled };
		fields['enable_teams'] = { value: collabSettingDto.teamsEnabled };
		fields['enable_slack'] = { value: collabSettingDto.slackEnabled };
		fields['enabled'] = { value: collabSettingDto.enabled };
		fields['enable_participant_suggestions'] = {value: collabSettingDto.expertFinderEnabled };
		fields['enable_legacy_support'] = {value: collabSettingDto.enableLegacySupport };
		fields['preference_channel'] = {value: collabSettingDto.preferenceChannel};
		_chatSettings['fields'] = fields;	

		if (_chatSettings.readOnly && gs.getCurrentScopeName() != collabSettingDto.sysScope) {
			var expectedScope = collabSettingDto.sysScope || 'CP Standard Feature Set';
			result.crossScopeMessage = gs.getMessage('This page can only be edited when {0} is the current application. Change the scope to make any updates.', '<strong>' + expectedScope + '</strong>');
			result.readOnly = true;
		}
		
		result.sys_cs_collab_settings = _chatSettings;
		
	} else {
		// if there is no collab settings record for the domain then set them all to false
		_chatSettings['sys_id'] = '-1';
		fields['enable_emojis'] = { value: false };
		fields['enable_teams'] = { value: false };
		fields['enable_slack'] = { value: false };
		fields['enabled'] = { value: false };
		fields['enable_participant_suggestions'] = { value: false };
		fields['enable_legacy_support'] = { value: true };
		fields['preference_channel'] = {value: ''};
		_chatSettings['fields'] = fields;
		result.sys_cs_collab_settings = _chatSettings;
	}
	
	var propertiesGr = new GlideRecord('sys_properties');
	propertiesGr.addQuery('name', 'com.glide.cs.collab.enabled');
	propertiesGr.query();
	if(propertiesGr.next()) {
		if(!propertiesGr.canWrite() && !isInSelectedScope(propertiesGr)) {
			var expectedScope = propertiesGr.getDisplayValue('sys_scope') || 'CP Standard Feature Set';
			result.crossScopeMessage = gs.getMessage('This page can only be edited when {0} is the current application. Change the scope to make any updates.', '<strong>' + expectedScope + '</strong>');
			result.readOnly = true;
		}
		
		var sys_properties = {};
		sys_properties[propertiesGr.getValue('name')] = {
			sys_id: propertiesGr.getUniqueValue(),
			name: propertiesGr.getValue('name'),
			value: propertiesGr.getValue('value')
		};
		
		readOnly = readOnly || !propertiesGr.canWrite();
		
		result.sys_properties = sys_properties;
	} else {
		result['error'] = gs.getMessage('Unable to fetch chat settings. Contact system administrator for details');
		readOnly = true;
	}
	
	var providerApplicationGr = new GlideRecord('sys_cs_collab_provider_application');
	providerApplicationGr.addActiveQuery();
	providerApplicationGr.query();
	var providerApplications = {};
	
	while(providerApplicationGr.next()){
		var providerApplication = {}; //in future change to store multiple providerApplications
		providerApplication.setup_status =  providerApplicationGr.getValue('setup_status');
		providerApplication.sys_id =  providerApplicationGr.getUniqueValue();
		providerApplication.provider = providerApplicationGr.getValue('provider');
		providerApplications[providerApplicationGr.getValue('name')] = providerApplication;

		if(providerApplicationGr.getValue('name') === 'Teams Application') {
			if(providerApplicationGr.getValue('setup_status') == "incomplete") {
				result.teamsDataImportingMessage = gs.getMessage("We’re loading your data. We’ll email you once your integration is ready to use.");
				result.currentTeamsProviderAppId = providerApplicationGr.getUniqueValue();
			} else if (providerApplicationGr.getValue('setup_status') == "error") {
				result.teamsDataImportingMessage = gs.getMessage("We’ve run into a technical issue. Please verify your API permissions on Azure and try again.");
			}
		}
		if(providerApplicationGr.getValue('name') === 'Slack Application') {
			if(providerApplicationGr.getValue('setup_status') == "incomplete") {
				result.slackDataImportingMessage = gs.getMessage("We’re loading your data. We’ll email you once your integration is ready to use.");
				result.currentSlackProviderAppId = providerApplicationGr.getUniqueValue();
			} else if (providerApplicationGr.getValue('setup_status') == "error") {
				result.slackDataImportingMessage = gs.getMessage("We’ve run into a technical issue. Please verify your API permissions on Slack and try again.");
			}
		}
		
	}
	
	result.providerApplications = providerApplications;
	result.readOnly = readOnly;
	return result;

	function isInSelectedScope(gr) {
		var currentScope = gs.getCurrentScopeName();
		var grScope = gr.getValue('sys_scope');
		return currentScope == grScope;
	}
}
