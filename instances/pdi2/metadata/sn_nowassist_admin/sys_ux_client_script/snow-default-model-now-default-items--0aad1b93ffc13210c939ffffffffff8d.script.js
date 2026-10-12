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
        data = api.state.modelsAndTypes.filter(i => i.genAiProvider === api.item.parent?.value?.sysId || i.all);
        return data.map(item=>{return{id:item.model,label:item.model,sublabel:item.modelType,modelId:item.modelId}});
    }
    return [];
}
