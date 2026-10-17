/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.elements.builder_core.contextState && api.elements.builder_core.contextState.upstreamMacroponents && api.elements.builder_core.mcpModel.macroponent && api.elements.builder_core.mcpModel.macroponent.extends) {
        return api.elements.builder_core.contextState.upstreamMacroponents[api.elements.builder_core.mcpModel.macroponent.extends];
    }
    return {};
}
