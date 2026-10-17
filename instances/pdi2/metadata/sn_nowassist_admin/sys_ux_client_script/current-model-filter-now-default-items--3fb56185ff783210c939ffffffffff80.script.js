/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.state.modelsAndTypes.map(item => {
        return {
            id: item.model,
            label: item.model,
            sublabel: item.modelType,
            modelId: item.modelId
        };
    });
}
