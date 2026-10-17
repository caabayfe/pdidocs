function transform(input) {
    try {
        if (input) {
            return {
                response: new sn_generative_ai.GenAIModelVersionUtil().processGenAIModelVersionMappingData(input.payload),
                type: input.type
            };
        }
    } catch (e) {
        gs.error("Set Model version data - " + e.toString());
        throw new Error("Failed to Set Model version data");
    }
}
