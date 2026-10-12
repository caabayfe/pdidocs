function transform(input) {
	try {
		return  NAARoleUtil.createACLForSkillConfig(input.skill_config, input.acl_data);
	} catch(e) {
		gs.error("Failed to fetch ACL data for skill config - " + e.toString());
		throw new Error("Failed to fetch ACL data for skill config");
	}
}
