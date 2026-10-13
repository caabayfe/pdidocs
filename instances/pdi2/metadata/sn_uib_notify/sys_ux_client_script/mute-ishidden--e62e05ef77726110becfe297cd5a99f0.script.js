/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.confDetails.active && api.state.isLoggedInUserActiveParticipant && api.state.loggedInUserTriggerActions.canMute) {
        return api.state.selfMuteHide;
    }
    return true;
}
