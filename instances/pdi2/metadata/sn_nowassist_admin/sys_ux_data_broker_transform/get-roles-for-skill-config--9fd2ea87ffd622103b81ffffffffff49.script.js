function transform(input) {
	try {
		var result = NAASkillAclUtil.getAllowedRolesForSkillConfig(input.skill_config);
		return result;
	} catch(e) {
		gs.error("Failed to fetch role data for skill config - " + e.toString());
		throw new Error("Failed to fetch role data for skill config");
	}
}
