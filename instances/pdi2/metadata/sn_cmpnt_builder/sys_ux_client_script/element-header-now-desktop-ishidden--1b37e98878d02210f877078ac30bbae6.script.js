/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const showConfigurePane = api.elements.builder_core.mcpModel &&
        api.elements.builder_core.selectedCompositionElement &&
        !api.elements.builder_core.selectedSlotName &&
        api.elements.builder_core.selectedCompositionElement.hasOwnProperty('preset') &&
        api.elements.builder_core.selectedElementId !== api.elements.builder_core.mcpModel.macroponent.sysId;

    const hideComponent = !showConfigurePane && (
        !api.elements.builder_core.selectedElementId ||
        !api.elements.builder_core.mcpModel ||
        !api.elements.component_builder.selectedPropertyItem ||
        api.elements.builder_core.selectedElementId === api.elements.builder_core.mcpModel.macroponent.sysId
    );

    return hideComponent;
}
