/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return (!api.data.controller.editColumnsProps.enableResetToDefaults && !api.data.controller.editColumnsProps.enableResetWidths && !api.data.controller.editColumnsProps.enableClearColumnCalculations);
}
