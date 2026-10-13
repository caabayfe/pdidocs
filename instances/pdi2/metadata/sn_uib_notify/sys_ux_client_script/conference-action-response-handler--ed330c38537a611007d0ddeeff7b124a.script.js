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
    const serviceProvider = api.state.serviceProvider;

    const apiData = api.data.notify_conference_do_action.output;
    if (!apiData) {
        return;
    }
    const data = apiData.result;
    const supportsPostActionsAndValidations = api.data.fetch_conf_driver_uxf_actions.output.supportsEventActionsAndIdentifiers;
    const confDriverActions = api.data.fetch_conf_driver_uxf_actions.output.confDriverActions;
    if (!serviceProvider || (typeof supportsPostActionsAndValidations === "undefined") || !confDriverActions)
        return;
    notifyConfUtils.handleConferenceActionResponse(api, helpers, serviceProvider, supportsPostActionsAndValidations, confDriverActions, false, data);

    const confCallId = api.state.conferenceID;

    if (data.action == notifyConfUtils.confActions.KICK && data.status == false) {
        let conferenceCalls = api.state.conferenceCalls;
        let ACTIVE_CALL_INDEX = 0;
        if(api.data.fetch_conference_calls.output)
         ACTIVE_CALL_INDEX = api.data.fetch_conference_calls.output.conferenceCallTypeIndex.ACTIVE;
        let activeCalls = conferenceCalls[ACTIVE_CALL_INDEX].callRecords;

        activeCalls.forEach(function(activeCall) {
            if (activeCall.callID === confCallId) {
                activeCall.disableLeaveCallButton = false;
            }
        });
        api.setState("conferenceCalls", [...conferenceCalls]);
    }

    // Navigating to drill down view on selfJoin success
    const confAction = api.state.confAction;
    /**
     * Adding additional check on errorMessages, this handles the case for MS Teams when
     * sn_notify_msteams.enable_calling_for_host is false, responseData.status is coming as false
     */ 
    if (confAction === "selfJoin" && confCallId && data && (data.status === true || (data.errorMessages && data.errorMessages.length === 0))) {
        // Adding a 500ms timeout value to load the drill down version after
        // finishing the complete execution of event handlers(adding success/error messages)
        helpers.timing.setTimeout(function() {
            api.emit("NOTIFY_CONFERENCE_CARD_CLICKED", {
                table: api.context.props.table,
                sysId: api.context.props.sysId,
                confId: confCallId
            });
        }, 500);
    }
}
