function transform(input) {
    try {
		var allowed_providers = NAAManageLLMAPI.getAllowedProviders();
		var all_skills = NAASkillConfigUtil.getNonComplaintSkills(allowed_providers, false, false);
		var active_skills =  allowed_providers.fallback ? [] : all_skills.filter(skill => skill.active);
        return {
			active_skills: active_skills,
			all_skills: all_skills,
			fallback: allowed_providers?.fallback || false,
			has_edit_access: NAARoleUtil._hasEditAccess()
		};
    } catch (error) {
        gs.error("Error while getting non complaint skills: " + error.toString());
        return false;
    }
}
