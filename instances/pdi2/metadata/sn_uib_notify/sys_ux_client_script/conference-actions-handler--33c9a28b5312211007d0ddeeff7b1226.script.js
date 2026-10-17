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
    if (!api.data.fetch_conference_calls.output)
        return;

    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const confData = api.data.fetch_conference_calls.output.conferenceTemplate;
    let conferenceCalls = api.state.conferenceCalls;
    const ACTIVE_CALL_INDEX = api.data.fetch_conference_calls.output.conferenceCallTypeIndex.ACTIVE;
    let activeCalls = conferenceCalls[ACTIVE_CALL_INDEX].callRecords;
    if (event.name == 'NOW_BUTTON#CLICKED') {
        confData.serviceProvider = event.context.item.value.sp.name;
        confData.confId = event.context.item.value.callID;
        if (event.elementId === 'join_call') {
            confData.addToWorkNotes = true;
            api.setState("conferenceDoAction", {
                action: notifyConfUtils.confActions.SELF_JOIN,
                confData: JSON.stringify(confData)
            });
            activeCalls.forEach(function(activeCall) {
                if (activeCall.callID === event.context.item.value.callID) {
                    activeCall.disableJoinConference = 1;
                    activeCall.disableLeaveCallButton = false;
                }
            });
            api.setState("conferenceCalls", [...conferenceCalls]);
            api.setState("serviceProvider", confData.serviceProvider);
            api.setState("conferenceID", confData.confId);
            api.setState("confAction", notifyConfUtils.confActions.SELF_JOIN);
        } else if (event.elementId === 'reinitiate_call') {
            if (api.state.reinitiateConfCallID === event.context.item.value.callID) {
                api.data.fetch_participants_to_reinitiate_call.refresh();
            } else {
                api.setState("reinitiateConfCallID", event.context.item.value.callID);
            }
            let result = {};
            result.provider = event.context.item.value.sp.name;
            result.message = event.context.item.value.message;
            result.number = "";
            if (event.context.item.value.sp.name === 'Telephony') {
                result.number = event.context.item.value.number;
            }
            result.conferenceTitle = event.context.item.value.title.original;
            if (event.context.item.value.invalidProvider) {
                if (!isNaN(event.context.item.value.alternativeProvider)) {
                    result.number = event.context.item.value.alternativeProvider;
                    result.provider = "Telephony";
                } else {
                    result.provider = event.context.item.value.alternativeProvider;
                }
            }
            api.setState("reinitiateConfCallDetails", result);
        }
    }
}
