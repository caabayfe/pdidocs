/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return (!api.state.commTaskDetails) || (!api.state.commTaskDetails.description) || (api.state.commTaskDetails.description == "");
}
