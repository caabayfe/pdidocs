function transform(inputs){
	var utils = new sn_wwna.WWNAUtils();
	var config;
	if(inputs.record_table_name && inputs.skill_config_id && inputs.record_sys_id && inputs.should_fetch_config){
		config = utils.fetchNACMSkillConfiguration(null, inputs.record_table_name, inputs.record_sys_id, null, inputs.skill_config_id);
	}
	return config;
	
}
