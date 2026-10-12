(function(context, pageParams, blockcontext) {
    try {
        var skillId = blockcontext.consentSkillId;
        return NAAGenAIUtil.setLLMConsentForSkill(skillId);
    } catch (error) {
        gs.error("Error in Set LLM Consent datablock:" + error.toString());
    }
})(context, pageParams, blockcontext);
