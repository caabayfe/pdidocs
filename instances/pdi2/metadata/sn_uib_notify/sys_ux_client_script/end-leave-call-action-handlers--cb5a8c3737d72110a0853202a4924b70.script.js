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
    if (!api.data.fetch_conference_calls.output)
        return;

    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const confData = api.data.fetch_conference_calls.output.conferenceTemplate;

    if (event.elementId === 'end_call_confirm') {
        const supportsPostActionsAndValidations = api.data.fetch_conf_driver_uxf_actions.output.supportsEventActionsAndIdentifiers;
        const confDriverActions = api.data.fetch_conf_driver_uxf_actions.output.confDriverActions;
        confData.serviceProvider = api.state.serviceProvider;
        confData.confId = api.state.conferenceID;
        confData.showAllMsgs = true;
        try {
            api.setState("isLoading", true);
            const response = await helpers.snHttp(`/api/sn_uib_notify/notify_uib/conferenceActionGet?conferenceDetails=${encodeURIComponent(JSON.stringify(confData))}&action=${notifyConfUtils.confActions.END}`, {
                method: "GET",
                batch: false
            });
            notifyConfUtils.handleConferenceActionResponse(api, helpers, confData.serviceProvider, supportsPostActionsAndValidations, confDriverActions, false, response.response.result);
        } catch (error) {
            if (error.data && error.data.error && error.data.error.message) {
                const message = error.data.error.message;
                api.emit(notifyConfUtils.GFORM_ADD_ERROR_MESSAGE, {
                    message: message
                });
            }
        }
    } else if (event.elementId === 'leave_end_button' || event.elementId === 'leave_call') {
        confData.serviceProvider = event.context.item.value.sp.name;
        let conferenceCalls = api.state.conferenceCalls;
        confData.confId = event.context.item.value.callID;
        const ACTIVE_CALL_INDEX = api.data.fetch_conference_calls.output.conferenceCallTypeIndex.ACTIVE;
        let activeCalls = conferenceCalls[ACTIVE_CALL_INDEX].callRecords;
        api.setState("serviceProvider", event.context.item.value.sp.name);
        confData.items = [];
        activeCalls.forEach(function(activeCall) {
            if (activeCall.callID === event.context.item.value.callID) {
                confData.items.push({
                    "notifyParticipantId": activeCall.loggedInUserNotifyParticipantID
                });
                activeCall.disableLeaveCallButton = true;
            }  
        });
         api.setState("conferenceCalls", [...conferenceCalls]);
        confData.showAllMsgs = true;
        api.setState("conferenceDoAction", {
            action: notifyConfUtils.confActions.KICK,
            confData: JSON.stringify(confData),
            timestamp: new Date().valueOf()
        });
    }
}
