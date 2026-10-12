/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var data = [{
        "id": "LLM",
        "label": "LLM models",
        "children": []
    },
    {
        "id": "SLM",
        "label": "SLM models",
        "children": []
    },
    {
        "id": "GENERIC",
        "label": "Generic models",
        "children": []
    }];

    var excludedModelTypes = {};
    api.state.excludedModelsAndTypes.forEach(item => {
        excludedModelTypes[item.modelId] = true;
    });
    
    const filteredData = api.state.modelsAndTypes.filter(item => item.genAiProvider === api.item.value.genAiProvider && !excludedModelTypes[item.modelId]) || [];
    
    filteredData.forEach(item => {
        var modelType = item.modelType; 
        var modelObj = {
            id: item.model,
            label: item.model,
            modelId: item.modelId
        };

        var category = data.find(cat => cat.id === modelType);
        if (category) {
            category.children.push(modelObj);
        }
    });

    return data.filter(category => category.children.length > 0);

}
