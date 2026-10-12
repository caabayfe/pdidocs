(function process( /*ResolverEnvironment*/ env) {
    const la_private_chat = sn_omnich_interact.ThirdPartyChatConstants.CAPABILITIES.PRIVATE_CHAT;
    const la_multi_party_chat = sn_omnich_interact.ThirdPartyChatConstants.CAPABILITIES.MULTIPARTY_CHAT;
    const la_third_party_integration = sn_omnich_interact.ThirdPartyChatConstants.CAPABILITIES.THIRD_PARTY_INTEGRATION;
    var whisperPropertyVal = false;
    var emojiPropertyVal = false;
    var isDynamicTranslationEnabledVal= false;
    var isGenAIEnabled = GlidePluginManager.isActive('com.glide.cs.genai');
    var interactionSysId = env.getArguments()["interactionSysId"];
    var cafLAUtils = new global.CAFLiveAgentUtils();
    var providerAppId = cafLAUtils.getProviderApplicationFromInteraction(interactionSysId);
    var providerAppGr = new GlideRecord(sn_omnich_interact.ThirdPartyChatConstants.PROVIDER_APPLICATION.TABLE);
    var thirdPartyIntegrationVal = "0";
    var multiPartyChatVal = "1";
    var providerProps = {};
    if (providerAppGr.get(providerAppId)) {
        providerProps = cafLAUtils.fetchCapabilityValue(providerAppId, [la_private_chat, la_multi_party_chat, la_third_party_integration]);
    }

    //fetch the provider application properties and check if Third party integration is enabled.    
    if (providerProps.hasOwnProperty(la_third_party_integration) && providerProps[la_third_party_integration] === "true") {
        thirdPartyIntegrationVal = "1";
    }
    var setupGR = new GlideRecord("sys_cs_live_agent_setup");
    setupGR.orderBy("sys_updated_on", true);
    setupGR.query();
    if (setupGR.next()) {
        if (thirdPartyIntegrationVal == "1" && providerProps.hasOwnProperty(la_private_chat)) {
            whisperPropertyVal = providerProps[la_private_chat] === "true" ? "1" : "0";
        } else {
            whisperPropertyVal = setupGR.getValue("agent_whisper");
        }
        emojiPropertyVal = setupGR.getValue("emoji_enabled");
        isDynamicTranslationEnabledVal = (setupGR.getValue("dynamic_translation") === "1");
    }

    if (thirdPartyIntegrationVal == "1" && providerProps.hasOwnProperty(la_multi_party_chat)) {
        multiPartyChatVal = providerProps[la_multi_party_chat] === "true" ? "1" : "0";
    }
    return {
        whisperEnabled: whisperPropertyVal,
        emojiEnabled: emojiPropertyVal,
        isGenAIEnabled: isGenAIEnabled,
        thirdPartyIntegration: thirdPartyIntegrationVal,
        multiPartyChatEnabled: multiPartyChatVal,
        isDynamicTranslationEnabled: isDynamicTranslationEnabledVal
    };

})(env);
