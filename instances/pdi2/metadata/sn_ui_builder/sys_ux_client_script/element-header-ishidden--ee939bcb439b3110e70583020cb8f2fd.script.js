/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return api.elements.builder_core.selectedElementId && api.elements.builder_core.mcpModel &&
        api.elements.builder_core.selectedCompositionElement !== null &&
		api.elements.builder_core.selectedSlotName === null &&
        api.elements.builder_core.selectedElementId !== api.elements.builder_core.mcpModel.macroponent.sysId &&
        api.elements.builder_core.selectedCompositionElement.hasOwnProperty('elementId') === true;
}
