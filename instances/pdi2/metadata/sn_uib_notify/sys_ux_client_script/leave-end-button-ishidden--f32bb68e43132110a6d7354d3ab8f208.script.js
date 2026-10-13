/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.parent.value.slot) return;
    var isLeaveAllowed = api.item.value.canLoggedInUserLeaveCall;
    var isEndAllowed = api.item.value.canLoggedInUserEndCall;

    return !api.item.value.active || !api.item.value.isLoggedInUserActiveParticipant || (!isLeaveAllowed && isEndAllowed) || (!isEndAllowed && isLeaveAllowed);
}
