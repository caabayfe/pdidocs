/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({api, helpers}) {
    const {skillsSourceModels, modelsAndTypes} = api.state;
    const {genAiProvider, capabilityId} = api.item.value;
    const allowedModels = skillsSourceModels[capabilityId];

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

    const filteredData = modelsAndTypes
        .filter(item => item.all || (item.genAiProvider === genAiProvider && allowedModels?.includes(item.model)));

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

    return data;
}
