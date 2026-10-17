/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.elements.builder_core.mcpModel && api.elements.builder_core.mcpModel.macroponent.internalEventMappings) {
        return Object.entries(
            api.elements.builder_core.mcpModel.macroponent.internalEventMappings
        ).map(
            ([eventApiName, targets]) =>
            ({
                eventMappingId: eventApiName,
                sourceEventApiName: eventApiName,
                sourceEventDefinition: {
                    id: null,
                    apiName: eventApiName,
                    type: 'UXEVENT'
                },
                targets
            })
        );
    }
    return [];
}
