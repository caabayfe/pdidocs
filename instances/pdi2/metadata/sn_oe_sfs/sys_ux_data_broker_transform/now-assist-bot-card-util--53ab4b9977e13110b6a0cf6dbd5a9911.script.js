function transform() {
	var showNLUCard = GlidePluginManager.isActive('com.glide.cs.chatbot');
    var showNowAssistCard = GlidePluginManager.isActive('com.glide.cs.genai');
    var isGuidedSetupTurnedOn = gs.getProperty('sn_nowassist_va.setup_updated', 'false') == 'true';

    return {
		"showNLUCard": showNLUCard,
        "showNowAssistCard": showNowAssistCard,
        "isGuidedSetupTurnedOn": isGuidedSetupTurnedOn,
    };
}
