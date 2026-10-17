/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
if(api.elements.builder_core.mcpModel && api.elements.builder_core.controllerPresetDefinitions){
    const controllerPresets = Object.values(
        api.elements.builder_core.controllerPresetDefinitions || {}
    ).flat();

    return (api.elements.builder_core.mcpModel.macroponent.data || [])
        .reduce((acc, resource) => {
            if (resource.definition.type === 'CONTROLLER' && resource.preset.id) {
                const presetDefinition = controllerPresets.find(
                    (preset) => preset.sysId === resource.preset.id
                );
                const hostEventHandlers = presetDefinition.hostEventHandlers || [];

                return [...hostEventHandlers, ...acc];
            }
            return acc;
        }, [])
        .map((event) => ({ ...event,
            isInherited: true
        }));
}
return [];
}
