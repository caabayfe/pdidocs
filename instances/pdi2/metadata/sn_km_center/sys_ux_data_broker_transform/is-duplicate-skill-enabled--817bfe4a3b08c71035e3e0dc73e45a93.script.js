function transform(input) {
	try{
		var api = new sn_nowassist_admin.NowAssistSkillConfig();
		var IDENTIFY_DUPLICATE_ARTICLES_SKILL_CAPABILITY_ID = '1d8ba13e773302103f075cea5b5a9931';
		var response = api.getSkillConfigurationWithBaseTableFallback(IDENTIFY_DUPLICATE_ARTICLES_SKILL_CAPABILITY_ID, {"table":"kb_knowledge"});
		return response;
	}catch(err){
		gs.error('Knowledge Center: Is Duplicate Skill Enabled Data Broker Error : ' + JSON.stringify(err));
	}
	return null;
}
