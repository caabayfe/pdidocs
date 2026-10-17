function transform(input) {
    try {
        if (input) {
            if (input.type == 'fetch_models_and_providers') {
                return {
                    type: "fetch_models_and_providers",
                    data: new sn_generative_ai.GenAIModelVersionUtil().getAllTheModelsByProvider()
                };
            } else if (input.type == 'fetch_models_by_capability') {
                return {
                    type: "fetch_models_by_capability",
                    data: new sn_generative_ai.GenAIModelVersionUtil().getAllTheModelsByCapability(input.payload.capability)
                };
            } else if (input.type == 'fetch_version_records' || input.type == "fetch_version_records_for_skills") {
                return {
                    type: input.type,
                    data: NAAManageModelVersions.fetchModelVersionsByProviders(input.payload.providers, input.payload.filters)
                };
            }
        }
    } catch (e) {
        gs.error("Get Model version data - " + e.toString());
        throw new Error("Failed to Get Model version data");
    }
}
