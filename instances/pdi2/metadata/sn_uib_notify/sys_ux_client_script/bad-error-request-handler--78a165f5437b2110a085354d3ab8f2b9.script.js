/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    var result = [];

    if (event.payload && event.payload.errors && event.payload.errors.length > 0)
        result.push({
            level: "critical",
            message: event.payload.errors[0].message
        });
    notifyConfUtils.showMultipleAlerts(api, result);

    const action = api.state.conferenceDoAction.action;
    if (action == notifyConfUtils.confActions.KICK) {
        const confCallId = api.state.conferenceID;
        let conferenceCalls = api.state.conferenceCalls;
        let ACTIVE_CALL_INDEX = 0;
        if (api.data.fetch_conference_calls.output)
            ACTIVE_CALL_INDEX = api.data.fetch_conference_calls.output.conferenceCallTypeIndex.ACTIVE;
        let activeCalls = conferenceCalls[ACTIVE_CALL_INDEX].callRecords;

        activeCalls.forEach(function(activeCall) {
            if (activeCall.callID === confCallId) {
                activeCall.disableLeaveCallButton = false;
            }
        });
        api.setState("conferenceCalls", [...conferenceCalls]);
    }else if (action == notifyConfUtils.confActions.END) {
        api.setState("isLoading", false);
    }
}
