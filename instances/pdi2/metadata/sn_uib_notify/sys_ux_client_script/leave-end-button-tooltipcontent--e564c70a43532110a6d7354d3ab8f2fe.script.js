/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var initialData = api.data.get_conference_initial_details.output;
    if (!initialData)
        return true;

    var spLabel;
    if (initialData.conferenceDetails && initialData.conferenceDetails.call && initialData.conferenceDetails.call.sp) {
        spLabel = initialData.conferenceDetails.call.sp.displayName;
    }

    var isEndAllowed = api.state.loggedInUserTriggerActions.canEndCall;
    var isLeaveAllowed = api.state.loggedInUserTriggerActions.canLeaveCall;
    if (api.state.confDetails.active && api.state.isLoggedInUserActiveParticipant && !isEndAllowed && !isLeaveAllowed)
        return helpers.translateSync("Leave and End call features are not supported for {0}", spLabel);
    return helpers.translateSync("Leave call");
}
