/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
if(api.elements.builder_core.mcpModel){
    return (api.elements.builder_core.mcpModel.macroponent.data || []).filter((resource) => resource.definition.type === 'CONTROLLER' && resource.preset.id).map(({
        disabledHostEventTargetIds
    }) => disabledHostEventTargetIds);
}
return [];
}
