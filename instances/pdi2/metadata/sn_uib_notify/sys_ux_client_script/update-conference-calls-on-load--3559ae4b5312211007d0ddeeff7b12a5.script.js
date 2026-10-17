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
    const conferenceCallsData = api.data.fetch_conference_calls.output;
    if (!conferenceCallsData)
        return;
    const ACTIVE_CALL_INDEX = conferenceCallsData.conferenceCallTypeIndex.ACTIVE;
    const COMPLETED_CALL_INDEX = conferenceCallsData.conferenceCallTypeIndex.COMPLETED;
    const UPCOMING_CALL_INDEX = conferenceCallsData.conferenceCallTypeIndex.UPCOMING;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const allConferenceCalls = conferenceCallsData.calls;
    const loggedInUserActiveParticipantSessionsPerCall = conferenceCallsData.loggedInUserActiveParticipantSessionsPerCall;
    const pollingInterval = conferenceCallsData.pollingInterval;
    if (!allConferenceCalls || !loggedInUserActiveParticipantSessionsPerCall || !pollingInterval)
        return;

    allConferenceCalls[COMPLETED_CALL_INDEX].callRecords.forEach((call) => {
        call.startTime = notifyConfUtils.formatDateTime(call.startTime);
    });

    notifyConfUtils.setCollapseIcon(allConferenceCalls[ACTIVE_CALL_INDEX]);
    notifyConfUtils.setCollapseIcon(allConferenceCalls[COMPLETED_CALL_INDEX]);
    notifyConfUtils.setCollapseIcon(allConferenceCalls[UPCOMING_CALL_INDEX]);

    allConferenceCalls[ACTIVE_CALL_INDEX].callRecords.forEach(function(call) {
        call.duration = notifyConfUtils.getDuration(call.startTimeEpoch);
    });

    // Update upcoming slot data
    if (api.context.props.upcomingSlotData && api.context.props.upcomingSlotData.length > 0){
        allConferenceCalls[UPCOMING_CALL_INDEX].callStatus = await helpers.translate("Pending ({0})", api.context.props.upcomingSlotData.length);
        allConferenceCalls[UPCOMING_CALL_INDEX].callRecords = [...api.context.props.upcomingSlotData];
    }

    const conferenceCalls = JSON.parse(JSON.stringify(allConferenceCalls));
    conferenceCalls[COMPLETED_CALL_INDEX].callRecords = allConferenceCalls[COMPLETED_CALL_INDEX].callRecords.slice(0, notifyConfUtils.DEFAULT_NO_OF_CARDS_TO_LOAD);

    const showEmptyState = (!conferenceCalls[ACTIVE_CALL_INDEX].callRecords.length && !conferenceCalls[COMPLETED_CALL_INDEX].callRecords.length && !(api.context.props.upcomingSlotData && api.context.props.upcomingSlotData.length > 0));
    if (allConferenceCalls[COMPLETED_CALL_INDEX].callRecords.length <= notifyConfUtils.DEFAULT_NO_OF_CARDS_TO_LOAD)
        api.setState("hideLoadMore", true);
    api.setState("showEmptyState", showEmptyState);
    api.setState("conferenceCalls", conferenceCalls);
    api.setState("completedCallIndex", COMPLETED_CALL_INDEX);
    api.data.fetch_active_participants.refresh();

    api.setState("loggedInUserActiveParticipantSessionsPerCall", loggedInUserActiveParticipantSessionsPerCall);

    api.setState("pollingInterval", pollingInterval);
    notifyConfUtils.debounce(api, helpers, pollingInterval);

    if (api.state.isLoading && api.state.allContentLoaded) {
        api.setState("isLoading", false);
        api.setState("allContentLoaded", false);
    }
}
