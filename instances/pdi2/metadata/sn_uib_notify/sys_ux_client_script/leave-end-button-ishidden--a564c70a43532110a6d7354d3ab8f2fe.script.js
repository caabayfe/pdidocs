/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var isEndAllowed = api.state.loggedInUserTriggerActions.canEndCall;
    var isLeaveAllowed = api.state.loggedInUserTriggerActions.canLeaveCall;
    return !api.state.confDetails.active || !api.state.isLoggedInUserActiveParticipant || (!isLeaveAllowed && isEndAllowed) || (!isEndAllowed && isLeaveAllowed);
}
