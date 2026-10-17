function transform(input) {
	try {
		return NAARoleUtil.updateACLRolesForSkillConfig(input.acl_data);
	} catch(e) {
		gs.error("Failed to update ACL data - " + e.toString());
		throw new Error("Failed to update ACL data for skill config");
	}
}
