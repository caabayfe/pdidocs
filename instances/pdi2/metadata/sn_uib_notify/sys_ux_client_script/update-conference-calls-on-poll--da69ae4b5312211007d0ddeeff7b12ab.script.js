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
    if (api.state.isLoading && api.state.allContentLoaded) {
        api.setState("isLoading", false);
        api.setState("allContentLoaded", false);
    }
    const participantsPerCall = api.data.fetch_active_participants.output;
    if (!participantsPerCall)
        return;

    const calls = api.state.conferenceCalls;
    if (!api.data.fetch_conference_calls.output || !Array.isArray(calls) || !calls.length)
        return;
    const ACTIVE_CALL_INDEX = api.data.fetch_conference_calls.output.conferenceCallTypeIndex.ACTIVE;
    for (let callID in participantsPerCall) {
        calls[ACTIVE_CALL_INDEX].callRecords.forEach(function(call) {
            if (call.callID === callID) {
                call.activeParticipants = participantsPerCall[callID].activeParticipants;
                call.isLoggedInUserActiveParticipant = participantsPerCall[callID].isLoggedInUserActiveParticipant;
            }
        });
    }
    api.setState("conferenceCalls", [...calls]);

    if (api.state.timerIntervalId)
        helpers.timing.clearInterval(api.state.timerIntervalId);
    const timerIntervalId = helpers.timing.setInterval(() => {
        calls[ACTIVE_CALL_INDEX].callRecords.forEach(function(call) {
            call.duration = notifyConfUtils.getDuration(call.startTimeEpoch);
        });
        api.setState("conferenceCalls", [...calls]);

    }, 1000);
    api.setState("timerIntervalId", timerIntervalId);
}
