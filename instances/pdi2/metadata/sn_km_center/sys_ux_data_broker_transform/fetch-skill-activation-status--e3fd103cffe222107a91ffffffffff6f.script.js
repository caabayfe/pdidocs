function transform(input) {
    var isSkillActive = 0;
	var skillNameFilter = input.skillNameFilter;
	try{
		var skillConfigApi = new sn_nowassist_admin.NowAssistSkillConfig();
		var GROUPING_CAPABILITY_ID = '1d8ba13e773302103f075cea5b5a9931';
		var response = skillConfigApi.getSkillConfigurationWithBaseTableFallback(GROUPING_CAPABILITY_ID, {"skill_name":skillNameFilter});
		isSkillActive = (response && response.active && (response.active == true)) ? 1 : 0;
	}catch(err){
		gs.error('Knowledge-Center: Fetch Skill Activation Status data broker : error ' + JSON.stringify(err));
	}
	return isSkillActive;
}
