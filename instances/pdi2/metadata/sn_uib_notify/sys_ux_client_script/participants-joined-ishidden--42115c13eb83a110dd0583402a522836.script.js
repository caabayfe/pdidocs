/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.searchEmptyState || (api.state.searchArrayInvited && api.state.searchArrayInvited.length > 0 &&
        (api.state.searchArrayJoined == 'undefined' || api.state.searchArrayJoined.length == 0)))
        return true;
    else
        return false;
}
