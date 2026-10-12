function transform(input) {
	//These are constants set for NAP client for the current release. If implementation on constants change on NAP client we might need to revisit this.
	var NAP_CONFIG_LOOKUP_HELPER_CONSTANT = {
		UNIFIED_NAVIGATION_APP: "c86a62e2c7022010099a308dc7c26022",
		SYS_UX_APP: "sys_ux_app",
		ENHANCED_CHAT: "self_service_dialog",
		INTEGRATED_CHAT: "ai_native_chat"
	};

	var CHAT_CONFIG_TABLES = {
		NOW_ASSIST_DEPLOYMENT_CONFIG: "sys_now_assist_deployment_config",
		CONTEXT_PROFILE_SEARCH: "sys_cs_context_profile_search",
		CONTEXT_PROFILE: "context_profile"
	};
	var isNAPEnabledWithAIEL = false;
	var settingsForNAP = {};
	var requiredPluginInstalled = GlidePluginManager().isActive("sn_nowassist_va");
	if (requiredPluginInstalled) {
		var helper = new sn_nowassist_va.NowAssistDeploymentChannelHelper();

		//when NAP is enabled (Enhanced chat)
		var enhancedChatGR = helper._getDeploymentChannelForExperience(NAP_CONFIG_LOOKUP_HELPER_CONSTANT.SYS_UX_APP, NAP_CONFIG_LOOKUP_HELPER_CONSTANT.UNIFIED_NAVIGATION_APP, NAP_CONFIG_LOOKUP_HELPER_CONSTANT.ENHANCED_CHAT);

		//when NextWave is enabled (Integrated Chat)
		var integratedChatGR = helper._getDeploymentChannelForExperience(NAP_CONFIG_LOOKUP_HELPER_CONSTANT.SYS_UX_APP, NAP_CONFIG_LOOKUP_HELPER_CONSTANT.UNIFIED_NAVIGATION_APP, NAP_CONFIG_LOOKUP_HELPER_CONSTANT.INTEGRATED_CHAT);

		var chatGR = null;
		var isIntegratedChatEnabled = false;
		if (integratedChatGR.next()) {
			chatGR = integratedChatGR;
			isIntegratedChatEnabled = true;
		} else if (enhancedChatGR.next()) {
			chatGR = enhancedChatGR;
		}

		if (chatGR && chatGR.now_assist_deployment.active) {
			isNAPEnabledWithAIEL = true;
			settingsForNAP["sys_deployment_channel_id"] = chatGR.getUniqueValue();
			var nowAssistDeploymentConfig = new GlideRecord(CHAT_CONFIG_TABLES.NOW_ASSIST_DEPLOYMENT_CONFIG);
			nowAssistDeploymentConfig.addQuery("now_assist_deployment", chatGR.now_assist_deployment);
			nowAssistDeploymentConfig.query();
			if (nowAssistDeploymentConfig.next()) {
				var sac = new GlideRecord(CHAT_CONFIG_TABLES.CONTEXT_PROFILE_SEARCH);
				sac.addQuery("context_profile", nowAssistDeploymentConfig.getValue(CHAT_CONFIG_TABLES.CONTEXT_PROFILE));
				sac.query();
				if (sac.next()) {
					settingsForNAP["search_evam_config"] = sac.getValue("search_result_config");
				}
			}
		}
	}

	settingsForNAP["isNAPEnabledWithAIEL"] = isNAPEnabledWithAIEL;
	settingsForNAP["isIntegratedChatEnabled"] = isIntegratedChatEnabled;
	return settingsForNAP;
}
