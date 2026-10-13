/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.searchArrayInvited && api.state.searchArrayInvited.length > 0)
        return api.state.searchArrayInvited;
    else
        return api.state.participantInvited;
}
