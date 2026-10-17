function transform(input) {
    try {
        var setLLMconsent = NAAGenAIUtil.setLLMConsentForSkill(input.skillConfigId);
        return setLLMconsent;
    } catch (error) {
        gs.error("Error while setting LLM consent: " + error.toString());
        return false;
    }
}
