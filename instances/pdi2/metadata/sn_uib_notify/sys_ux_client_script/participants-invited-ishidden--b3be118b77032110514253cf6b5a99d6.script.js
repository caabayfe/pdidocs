/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.searchEmptyState ||
        (api.state.searchArrayJoined && api.state.searchArrayJoined.length > 0 &&
            (api.state.searchArrayInvited == 'undefined' || api.state.searchArrayInvited.length == 0)))
        return true;
    else
        return false;
}
