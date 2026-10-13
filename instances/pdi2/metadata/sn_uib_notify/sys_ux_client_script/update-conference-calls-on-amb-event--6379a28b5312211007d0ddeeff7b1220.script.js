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
    if (!event || !event.payload || !event.payload.data)
        return;
    const callsData = api.data.fetch_conference_calls.output;
    if (!callsData)
        return;
    const ACTIVE_CALL_INDEX = callsData.conferenceCallTypeIndex.ACTIVE;
    const COMPLETED_CALL_INDEX = callsData.conferenceCallTypeIndex.COMPLETED;
    const eventData = event.payload.data;
    if (!eventData || !eventData.sys_id)
        return;
    const conferenceCalls = api.state.conferenceCalls;
    const activeCalls = conferenceCalls[ACTIVE_CALL_INDEX].callRecords;
    const completedCalls = conferenceCalls[COMPLETED_CALL_INDEX].callRecords;
    const allCompletedConfCalls = callsData.calls[COMPLETED_CALL_INDEX].callRecords;
    const pollingInterval = api.state.pollingInterval;
    let isLoading = null;
    if (event.elementId === "conference_calls_watcher" && event.name === "RECORD_WATCHER#MESSAGE_RECEIVED") {
        if (eventData.action === "change" && eventData.operation === "update") {
            if (Array.isArray(eventData.changes) && eventData.changes.indexOf("active") !== -1) {
                if (eventData.record && eventData.record.active && eventData.record.active.value === "false") {
                    notifyConfUtils.shuffleCallCard(eventData, activeCalls, completedCalls, eventData.record.active.value, true);
                    notifyConfUtils.shuffleCallCard(eventData, activeCalls, allCompletedConfCalls, eventData.record.active.value, false);
                    conferenceCalls[ACTIVE_CALL_INDEX].callStatus = await helpers.translate("Active ({0})", conferenceCalls[ACTIVE_CALL_INDEX].callRecords.length);
                    conferenceCalls[COMPLETED_CALL_INDEX].callStatus = await helpers.translate("Completed ({0})", allCompletedConfCalls.length);
                    isLoading = false;
                    if (api.state.isSearchingAndFiltering === true) {
                        const searchAndFilterResults = api.state.searchAndFilterResults;
                        const activeCalls = searchAndFilterResults[ACTIVE_CALL_INDEX].callRecords;
                        const completedCalls = searchAndFilterResults[COMPLETED_CALL_INDEX].callRecords;
                        notifyConfUtils.shuffleCallCard(eventData, activeCalls, completedCalls, eventData.record.active.value, false);
                        searchAndFilterResults[ACTIVE_CALL_INDEX].callStatus = await helpers.translate("Active ({0})", activeCalls.length);
                        searchAndFilterResults[COMPLETED_CALL_INDEX].callStatus = await helpers.translate("Completed ({0})", completedCalls.length);
                        api.state("searchAndFilterResults", searchAndFilterResults);
                    }
                } else {
                    api.setState("newConfCallID", eventData.sys_id);
                    if (api.state.showEmptyState === true)
                        api.setState("showEmptyState", false);
                    notifyConfUtils.debounce(api, helpers, pollingInterval);
                }
            }
        } else if (eventData.action === "entry" && eventData.operation === "insert") {
            api.setState("newConfCallID", eventData.sys_id);
            if (api.state.showEmptyState === true)
                api.setState("showEmptyState", false);
            notifyConfUtils.debounce(api, helpers, pollingInterval);
        }
    } else if (event.elementId === "participant_session_watcher" && event.name === "RECORD_WATCHER#MESSAGE_RECEIVED") {
        let loggedInUserActiveParticipantSessionsPerCall = api.state.loggedInUserActiveParticipantSessionsPerCall;
        if (Array.isArray(eventData.changes)) {
            if (eventData.changes.indexOf("active") !== -1) {
                const sessionID = eventData.sys_id;
                if (eventData.record && eventData.record.active && eventData.record.active.value === "true") {
                    const callIDfromRW = eventData.record["notify_participant.notify_conference_call"].value;
                    if (!callIDfromRW)
                        return;
                    if (!loggedInUserActiveParticipantSessionsPerCall[callIDfromRW])
                        loggedInUserActiveParticipantSessionsPerCall[callIDfromRW] = {};
                    loggedInUserActiveParticipantSessionsPerCall[callIDfromRW][sessionID] = null;
                } else {
                    for (let callID in loggedInUserActiveParticipantSessionsPerCall) {
                        if (loggedInUserActiveParticipantSessionsPerCall[callID][sessionID] === null) {
                            delete loggedInUserActiveParticipantSessionsPerCall[callID][sessionID];
                        }
                    }
                }
                activeCalls.forEach(function(call) {
                    if (loggedInUserActiveParticipantSessionsPerCall[call.callID]) {
                        const hasLoggedInUserActiveParticipantSession = Object.keys(loggedInUserActiveParticipantSessionsPerCall[call.callID]).length !== 0;
                        call.disableJoinConference  = hasLoggedInUserActiveParticipantSession;
                        call.disableLeaveCallButton = !hasLoggedInUserActiveParticipantSession;
                    }
                });
                api.setState("loggedInUserActiveParticipantSessionsPerCall", loggedInUserActiveParticipantSessionsPerCall);
            }
            if (eventData.action === "entry" && eventData.operation === "insert" && eventData.changes.indexOf("notify_participant") !== -1 && eventData.changes.indexOf("notify_participant.notify_conference_call") !== -1) {
                activeCalls.forEach(function(call) {
                    if (eventData.record["notify_participant.notify_conference_call"].value === call.callID) {
                        call.loggedInUserNotifyParticipantID = eventData.record["notify_participant"].value;
                        return;
                    }
                });
            }
        }
    }
    api.setState("conferenceCalls", [...conferenceCalls]);
    if (isLoading !== null) {
        api.setState("isLoading", isLoading);
    }
}
