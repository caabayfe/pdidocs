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
        controllerConfigGuidance: {
            type: "JSON_LITERAL",
            value: api.elements.controller_builder.controllerModel.controllerConfigGuidance
        }
    };
}
