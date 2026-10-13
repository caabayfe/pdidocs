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
    if (!api.data.get_conference_initial_details.output)
        return;

    const confData = api.data.get_conference_initial_details.output.conferenceTemplate;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    if (api.state.confDetails && api.state.confDetails.sp)
        confData.serviceProvider = api.state.confDetails.sp.name;
    confData.confId = api.context.props.confId;

    if (event.elementId === 'end_call_confirm') {
        confData.showAllMsgs = true;
        const supportsPostActionsAndValidations = api.data.fetch_conf_driver_uxf_actions.output.supportsEventActionsAndIdentifiers;
        const confDriverActions = api.data.fetch_conf_driver_uxf_actions.output.confDriverActions;
        
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
        confData.items.push({
            "notifyParticipantId": api.state.currentUserSelected
        });
        confData.showAllMsgs = true;
        api.setState("conferenceDoAction", {
            action: notifyConfUtils.confActions.KICK,
            confData: JSON.stringify(confData)
        });
        api.setState("disableLeaveCallButton", true);
    }
}
