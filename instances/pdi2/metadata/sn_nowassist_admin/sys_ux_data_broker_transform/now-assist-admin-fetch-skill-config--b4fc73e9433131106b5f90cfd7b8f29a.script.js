function transform(input) {
	try {
		return NAASkillConfigUtil.getSkillConfig(input.sys_id);
	} catch(e) {
		gs.error("Failed fetch Skill Configuration - " + e);
		throw new Error("Failed to fetch skill configuration");
	}
}
