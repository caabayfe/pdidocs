/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        fieldProps: [],
        optionalProps: [],
        macroponentProps: api.elements.builder_core.macroponentProperties.macroponentProps
    };
}
