/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var spLabel;
    if (api.item.parent.value.slot) return;
    if (api.item.value.sp) {
        spLabel = api.item.value.sp.displayName;
    }

    var isLeaveAllowed = api.item.value.canLoggedInUserLeaveCall;
    var isEndAllowed = api.item.value.canLoggedInUserEndCall;

    if (api.item.value.active && api.item.value.isLoggedInUserActiveParticipant && !isEndAllowed && !isLeaveAllowed)
        return helpers.translateSync("Leave and End call features are not supported for {0}", spLabel);
    return helpers.translateSync("Leave call");
}
