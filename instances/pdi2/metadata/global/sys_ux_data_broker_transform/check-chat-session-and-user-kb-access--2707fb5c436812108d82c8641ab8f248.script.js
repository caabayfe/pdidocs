function transform(input) {
	return checkUserAccessAndPluginDetails();

	function checkUserAccessAndPluginDetails() {
		var output = {};
		const interactionSysId = input.interactionSysId;
		var interactionGr = new GlideRecord('interaction');
		interactionGr.get(interactionSysId);
		if (!interactionGr.canRead()) {
			return output;
		}

		// check for live agent active chat session
		output.isLiveAgentChatActive = checkActiveChatSession(interactionGr);
		// check for user kb access
		output.userHasKbAccess = checkUserKbAccess(interactionGr, input.kbSysId);
		// return interaction type 
		output.interactionType = interactionGr.getValue('type');

		if(output.interactionType === 'phone' || output.interactionType === 'messaging') {
			var glidePluginMngr = new GlidePluginManager();
			var otherPluginsActive = glidePluginMngr.isActive('com.sn_awa_sms_int') && glidePluginMngr.isActive('com.sn_agent_messaging') && glidePluginMngr.isActive('com.sn_agent_initiated');
        		
        		// Check if any SMS provider exists 
        		var smsProviderExists = false;
        		var grProvider = new GlideRecord('sys_cs_provider');
        		grProvider.addQuery('channel', '5ae1b3e3771700105d7b3882a91061bd'); // SMS channel type
        		grProvider.query();
        		if (grProvider.hasNext()) {
        			smsProviderExists = true;
        		}
      			output.checkConvSmsServPluginInstalled = otherPluginsActive && smsProviderExists;
    		}

		return output;
	}

	function checkActiveChatSession(interactionGr) {
		return interactionGr.type == 'chat' && interactionGr.agent_chat && interactionGr.active;
	}

	function checkUserKbAccess(interactionGr, kbSysId) {
		const userSysId = getUserFromInteractionRecord(interactionGr);
		let userHasKbAccess = false;
		const knowledgeAPI = new global.KBCommon();
		if (userSysId) {
			userHasKbAccess = knowledgeAPI.isViewAsUserHasArticleAccess(userSysId, kbSysId);
		} else {
			userHasKbAccess = knowledgeAPI.checkGuestUserHasAccess(kbSysId);
		}

		return userHasKbAccess;
	}

	function getUserFromInteractionRecord(interactionGr){
		let userSysId = '';
		if (interactionGr.direction == 'inbound') {
			userSysId = interactionGr.opened_for;
		} else {
			if (interactionGr.contact) {
				userSysId = interactionGr.contact;
			} else if (interactionGr.consumer) {
				userSysId = interactionGr.consumer.user;
			} else if (interactionGr.req_service_org) {
				userSysId = interactionGr.opened_for;
			}
		}

		return userSysId;
	}
}
