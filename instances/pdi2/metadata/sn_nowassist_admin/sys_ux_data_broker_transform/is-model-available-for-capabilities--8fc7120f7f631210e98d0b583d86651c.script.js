function transform(input) {
    try {
        var response = NAAGenAIUtil.isModelAvailableForCapabilities(input);
        return response;
    } catch (e) {
        gs.error("Is Model Available for capabilities transform data broker is failed: " + e.toString());
    }
}
