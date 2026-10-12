function transform(input){
	if(!input.skillConfigId){
		return {};
	}
	var adminUtils = new sn_nowassist_admin.NowAssistSkillConfig();
	var guidedSetupData = adminUtils.getSkillConfiguration(input.skillConfigId);
	let varSetLength = guidedSetupData.variable_sets.length;
	let actionTemplateConfig;
	for(let i = 0; i < varSetLength; i++){
		if(guidedSetupData.variable_sets[i].config_type === sn_wwna.WWNAConstants.WWNA_CONFIG_TYPE_ID){
			actionTemplateConfig = guidedSetupData.variable_sets[i];
			break;
		}
	}
	return actionTemplateConfig;
}
