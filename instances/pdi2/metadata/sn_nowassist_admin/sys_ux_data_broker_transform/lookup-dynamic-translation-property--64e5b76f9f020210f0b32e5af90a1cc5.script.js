function transform(input) {
    var propValue = gs.getProperty('sn_generative_ai.disable_dynamic_translation', true);
    var value = propValue === 'true' || propValue === '1';
	var provider = NAAManageLLMAPI.getAllowedProviders()["providers"];
	var isLTSAllowed =  provider.some(i => i['id'] == NAAConstant.GEN_AI_PROVIDER_NOW_LLM_LTS);
	var isNewLTSInstance = isLTSAllowed && gs.getProperty('sn_generative_ai.is_lts_supported') === 'true';
	var lts_alert_viewed = gs.getUser().getPreference('NOW_ASSIST_LTS_ALERT');
	if (isNewLTSInstance) {
		gs.getUser().savePreference('NOW_ASSIST_LTS_ALERT', true);
	}
	return {
		value: value,
		isAICTInstalled: GlidePluginManager.isActive("sn_ai_governance"),
		isAICTConfigured: NAAGenAIUtil.getTotalRecordsInTable("sys_gen_ai_provider_routing")> 0,
		isNewLTSInstance: !lts_alert_viewed && isNewLTSInstance,
		isLTSRemoved: gs.getProperty('sn_generative_ai.is_lts_supported') === 'false',
		ltsRemovedAlertText: sn_i18n.Message.getMessage("sn_nowassist_admin", "This upgrade supports only Now LLM Service - Standard. To ensure compatibility, contact your AI steward to update settings in the AI Control Tower or choose another model provider for skills previously using NowLLM LTS."),
		newLTSInstanceAlertText: sn_i18n.Message.getMessage("sn_nowassist_admin", "We've introduced a new AI model provider, NowLLM Service - LTS. You can now select them for your instance, skills, and skill groups.")
	};
}
