/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.controller.inputs.enableQuickFormNavigation == undefined) {
        return !api.data.controller.inputs.nestBy;
    }
    return api.data.controller.inputs.enableQuickFormNavigation;
}
