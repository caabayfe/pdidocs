/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var data = [];
    if (api.state.modelsAndTypes?.length > 0) {
        var excludedModelTypes = {};
        api.state.excludedModelsAndTypes.forEach(item=>{
            excludedModelTypes[item.modelId] = true;
        });
        data = api.state.modelsAndTypes.filter(i => i.genAiProvider === api.item.parent?.value?.sysId && !excludedModelTypes[i.modelId]);
        return data.map(item=>{return{id:item.model,label:item.model, sublabel:item.modelType,modelId:item.modelId}});
    }
    return [];
}
