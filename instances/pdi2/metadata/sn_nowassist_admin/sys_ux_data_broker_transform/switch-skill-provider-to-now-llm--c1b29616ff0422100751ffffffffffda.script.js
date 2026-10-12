function transform(input) {
    try {
        var response = NAAGenAIUtil.switchSkillProvidertoNowLLM(input.skillConfigId);
        return response.status;
    } catch (error) {
        gs.error("Error while Switching provider to Now LLM: " + error.toString());
        return false;
    }
}
