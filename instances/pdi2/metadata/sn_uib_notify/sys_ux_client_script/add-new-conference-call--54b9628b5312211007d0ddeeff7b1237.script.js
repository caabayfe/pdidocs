/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const newCallData = api.data.fetch_conference_call_details.output;
    const allCalls = api.data.fetch_conference_calls.output;
    if (!newCallData || !allCalls)
        return;
    const ACTIVE_CALL_INDEX = allCalls.conferenceCallTypeIndex.ACTIVE;
    const newConfCall = newCallData.call;
    const loggedInUserActiveParticipantSessionsPerCallNew = newCallData.loggedInUserActiveParticipantSessionsPerCall;
    const conferenceCalls = api.state.conferenceCalls;
    const loggedInUserActiveParticipantSessionsPerCall = api.state.loggedInUserActiveParticipantSessionsPerCall;
    if (newConfCall) {
        conferenceCalls[ACTIVE_CALL_INDEX].callRecords.splice(0, 0, newConfCall);
        conferenceCalls[ACTIVE_CALL_INDEX].callStatus = await helpers.translate("Active ({0})", conferenceCalls[ACTIVE_CALL_INDEX].callRecords.length);
    }
    if (loggedInUserActiveParticipantSessionsPerCallNew)
        loggedInUserActiveParticipantSessionsPerCall[newConfCall.callID] = loggedInUserActiveParticipantSessionsPerCallNew[newConfCall.callID];

    api.setState("conferenceCalls", [...conferenceCalls]);
    api.setState("loggedInUserActiveParticipantSessionsPerCall", loggedInUserActiveParticipantSessionsPerCall);

    if (api.state.isSearchingAndFiltering === true)
        await notifyConfUtils.searchAndFilterCallCards(api.state.searchQuery, api.state.filterQuery, api, helpers);
}
