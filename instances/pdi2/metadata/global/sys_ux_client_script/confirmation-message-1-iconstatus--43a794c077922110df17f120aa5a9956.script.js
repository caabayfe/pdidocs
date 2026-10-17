/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.isValidLink && !api.state.isLinkExpired && !api.state.isFetchFailed)
        return "positive";
    else
        return "critical";
}
