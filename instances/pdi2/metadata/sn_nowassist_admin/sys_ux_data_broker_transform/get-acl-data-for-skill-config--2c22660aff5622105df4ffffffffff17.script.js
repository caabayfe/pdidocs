function transform(input) {
	try {
		return NAASkillAclUtil.getSkillAclData(input.skill_config);
	} catch(e) {
		gs.error("Failed to fetch ACL data for skill config - " + e.toString());
		throw new Error("Failed to fetch ACL data for skill config");
	}
}
