(function(context, pageParams, blockcontext) {
    try {
        var skillId = blockcontext.consentSkillId;
        var switchToNowLLMSuccessMessage = sn_i18n.Message.getMessage("sn_nowassist_admin", "You've enabled Now LLM for {skillName} skill.", {
            skillName: blockcontext.consentSkillName
        });
        var switchToNowLLM = NAASkillConfigValidator.isNowLLMAvailableForSkill(skillId);
        return {
            switchToNowLLM: switchToNowLLM,
            switchToNowLLMSuccessMessage: switchToNowLLMSuccessMessage
        };
    } catch (error) {
        gs.error("Error occurred in Switch to Now LLM check block: " + error.toString());
        return {
            switchToNowLLM: false,
        };
    }
})(context, pageParams, blockcontext);
