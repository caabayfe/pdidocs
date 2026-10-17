(function(context, pageParams, blockcontext) {
    try {
        var skillId = blockcontext.consentSkillId;
        var response = NAAGenAIUtil.switchSkillProvidertoNowLLM(skillId);
        return {
            status: response.status
        };
    } catch (error) {
        gs.error("Error in Switch to Now LLM datablock:" + error.toString());
    }
})(context, pageParams, blockcontext);
