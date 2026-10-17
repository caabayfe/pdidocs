(function process( /*ResolverEnvironment*/ env) {

    if (typeof sn_dt_api == "undefined")
        return false;

	var oneApiEnabled = gs.getProperty("com.glide.cs.one.api.disabled", true) === 'false';
	var agentChatDTenabled = false;
	if (oneApiEnabled) {
		var chatSetupGr = new GlideRecord('sys_cs_live_agent_setup');
		chatSetupGr.addQuery('sys_id', 'f0acbc4c5f091300e6333654de7313c8');
		chatSetupGr.query();

		if (chatSetupGr.next()) {
			agentChatDTenabled = chatSetupGr.getValue('dynamic_translation') === '1';
		}
	} else {
		agentChatDTenabled = gs.getProperty('com.glide.cs.dynamic.translation.enable.virtual_agent', 'false') === 'true';
	}

    var conversation = env.getArguments()["conversationSysId"];
    var nluModelType = 'nlu_keyword';
    var llmModelType = 'llm';
    var modelTypes = [nluModelType, llmModelType];

    //Pre-Y instances when upgrading, will be defaulted to NLU model since the previous version of GraphQL does not
    //have conversation as a parameter
    var conversationModelType = nluModelType;
    if (typeof conversation !== 'undefined' && conversation !== null) {
        conversationModelType = new sn_omnich_interact.AgentChatDynamicTranslationUtil().getConversationModelType(conversation);
    }
    if (typeof conversationModelType === 'undefined' || conversationModelType === null || !modelTypes.includes(conversationModelType)) {
        conversationModelType = nluModelType;
    }

    var configurationCheckResult = false;
    switch (conversationModelType) {
        case nluModelType: {
            var isEnabledResponse = sn_dt_api.DynamicTranslation.isEnabled();
            if (isEnabledResponse && isEnabledResponse.batchTranslation) {
                configurationCheckResult = true;
            }
            break;
        }
        case llmModelType: {
            configurationCheckResult = true;
            break;
        }
        default: {
            configurationCheckResult = false;
        }
    }

    return {
        sysPropertyValue: agentChatDTenabled,
        configurationCheckResult: configurationCheckResult
    };
})(env);
