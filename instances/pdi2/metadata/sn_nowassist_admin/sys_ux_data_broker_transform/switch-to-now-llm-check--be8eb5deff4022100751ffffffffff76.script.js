function transform(input) {
    try {
        var switchToNowLLM = NAASkillConfigValidator.isNowLLMAvailableForSkill(input.skillConfigId);
        return switchToNowLLM;
    } catch (error) {
        gs.error("Error occurred in Switch to Now LLM check block: " + error.toString());
        return false;
    }
}
