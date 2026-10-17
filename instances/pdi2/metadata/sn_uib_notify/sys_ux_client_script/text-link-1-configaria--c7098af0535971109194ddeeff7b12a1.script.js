/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const ariaObj = {
        "aria-label": ""
    };
    if (api.state.confDetails.sp) {
        ariaObj["aria-label"] = helpers.translateSync("Open {0} link", api.state.confDetails.sp.name);
    }
    return ariaObj;
}
