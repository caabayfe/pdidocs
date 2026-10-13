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
    if (!api.data.get_conference_initial_details.output)
        return;
    const confData = api.data.get_conference_initial_details.output.conferenceTemplate;
    if (api.state.confDetails && api.state.confDetails.sp)
        confData.serviceProvider = api.state.confDetails.sp.name;
    confData.confId = api.context.props.confId;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    if (event.name = 'NOW_BUTTON#CLICKED') {
        if (event.elementId === 'join_call') {
            confData.addToWorkNotes = true;
            api.setState("conferenceDoAction", {
                action: notifyConfUtils.confActions.SELF_JOIN,
                confData: JSON.stringify(confData)
            });
            api.setState("disableJoinCallButton", true);
        } else if (event.elementId === 'reinitiate_call') {
            var conferenceCallDetails = JSON.parse(JSON.stringify(api.data.get_conference_initial_details.output.conferenceDetails));
            if (conferenceCallDetails.call.invalidProvider) {
                if (!isNaN(conferenceCallDetails.call.alternativeProvider)) {
                    conferenceCallDetails.call.number = conferenceCallDetails.call.alternativeProvider;
                    conferenceCallDetails.call.sp.name = "Telephony";
                } else {
                    conferenceCallDetails.call.sp.name = conferenceCallDetails.call.alternativeProvider;
                }
            }
            api.setState("reinitiateConfCallDetails", conferenceCallDetails);
            api.data.fetch_participants_to_reinitiate_call.refresh();
        } else if (event.elementId === 'mute_all') {
            try {
                helpers.snHttp(`/api/sn_uib_notify/notify_uib/conferenceActionGet?conferenceDetails=${encodeURIComponent(JSON.stringify(confData))}&action=${notifyConfUtils.confActions.MULTI_MUTE}`, {
                    method: "GET",
                    batch: false
                });
            } catch (error) {
                if (error.data && error.data.error && error.data.error.message) {
                    const message = error.data.error.message;
                    api.emit(notifyConfUtils.GFORM_ADD_ERROR_MESSAGE, {
                        message: message
                    });
                }
            }
        }
    }
}
