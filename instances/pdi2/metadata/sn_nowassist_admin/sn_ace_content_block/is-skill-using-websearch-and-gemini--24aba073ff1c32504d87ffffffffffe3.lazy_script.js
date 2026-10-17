
(function(context, pageParams, blockcontext){
	var mapping = NAAGenAIUtil.getProviderForSkillConfig(blockcontext.skillId);
	try {
		return NAASkillConfigUtil.checkIfSkillUsingWebSearchForAlert(mapping.associatedCapabilityAndGenAiProviderMap);
	} catch(e) {
		gs.error("Failed fetch Check For Skill using Websearch and Gemini - " + e);
		throw new Error("Failed fetch Check For Skill using Websearch and Gemini");
	}
	// return some_output
})(context, pageParams, blockcontext);
