/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    if (!api.data.fetch_conference_calls.output)
        return;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const COMPLETED_CALL_INDEX = api.data.fetch_conference_calls.output.conferenceCallTypeIndex.COMPLETED;
    const allConferenceCalls = api.data.fetch_conference_calls.output.calls;
    const allCompletedConfCalls = allConferenceCalls[COMPLETED_CALL_INDEX].callRecords;

    const conferenceCalls = api.state.conferenceCalls;
    if (!conferenceCalls)
        return;
    const completedConfCallsCount = conferenceCalls[COMPLETED_CALL_INDEX].callRecords.length;

    if (event && event.context && event.context.item && event.context.item.index === COMPLETED_CALL_INDEX) {
        conferenceCalls[COMPLETED_CALL_INDEX].callRecords = allCompletedConfCalls.slice(0, completedConfCallsCount + notifyConfUtils.DEFAULT_NO_OF_CARDS_TO_LOAD);
    }

    if (conferenceCalls[COMPLETED_CALL_INDEX].callRecords.length === allCompletedConfCalls.length)
        api.setState("hideLoadMore", true);
    api.setState("conferenceCalls", [...conferenceCalls]);
}
