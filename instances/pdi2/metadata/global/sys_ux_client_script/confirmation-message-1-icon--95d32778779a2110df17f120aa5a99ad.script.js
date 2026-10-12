/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    if (api.state.isFetchFailed || !api.state.isInitialized)
        return "Triangle Exclamation Outline";
    else if (api.state.isValidLink && !api.state.isLinkExpired)
        return "Download Outline";
    else
        return "Unlink Outline";
}
