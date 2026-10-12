function transform(input) {
	try {
		var fallback = {"getFallbackRecommendations": !gs.nil(input.parent_id), "parentId": input.parent_id};
		return NAARoleMaskingUtil.getRoleMaskingRolesForSkill(input.skill_config, fallback);
	} catch(e) {
		gs.error("Failed to fetch Role Masking data for skill config - " + e.toString());
		throw new Error("Failed to fetch Role Masking data for skill config");
	}
}
