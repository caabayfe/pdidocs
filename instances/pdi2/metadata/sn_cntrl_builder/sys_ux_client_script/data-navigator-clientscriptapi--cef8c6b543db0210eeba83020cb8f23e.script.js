/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.elements.builder_core.resolvedContext.outputs) {
        return {};
    }
    const updatedResolvedContext = { ...api.elements.builder_core.resolvedContext.outputs.page
    };
    updatedResolvedContext.context.props = api.elements.builder_core.resolvedContext.inputs.page.props;
    delete updatedResolvedContext.outputPropMappings;
    delete updatedResolvedContext.context.app;

    return updatedResolvedContext;
}
