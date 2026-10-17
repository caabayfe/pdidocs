/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.searchArrayJoined && api.state.searchArrayJoined.length > 0)
        return api.state.searchArrayJoined;
    else
        return api.state.participants;
}
