/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.confDetails.sp) {
        return helpers.translateSync("Open {0} link", api.state.confDetails.sp.name);
    }
    return "";
}
