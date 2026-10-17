/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    // We need to bring in the normal binding context AND any @item bindings from a modeless or repeater
    const specialBindings = api.elements.builder_core.selectedElementSpecialBindings ? api.elements.builder_core.selectedElementSpecialBindings.bindings : {}
    const pageContext = {
        context: {
            app: api.elements.builder_core.resolvedContext.inputs.app,
            session: api.elements.builder_core.resolvedContext.inputs.session,
            props: api.elements.builder_core.resolvedContext.inputs.page.props,
            deviceInfo : api.elements.builder_core.resolvedContext.outputs.page.context.deviceInfo
        },
        data: api.elements.builder_core.resolvedContext.outputs.page.data,
        elements: api.elements.builder_core.resolvedContext.outputs.page.elements,
        state: api.elements.builder_core.resolvedContext.outputs.page.state,
        elementAndDataResourceNameMaps: api.elements.builder_core.resolvedContext.outputs.page.elementAndDataResourceNameMaps,
        // @item bindings
        ...specialBindings
    };

    return pageContext;
}
