/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.userDetails || api.state.userDetails.active != "1") return true;
    return (api.state.contextProps.actionLabelsArray) ? !(api.state.contextProps.actionLabelsArray.length > 0) : true;
}
