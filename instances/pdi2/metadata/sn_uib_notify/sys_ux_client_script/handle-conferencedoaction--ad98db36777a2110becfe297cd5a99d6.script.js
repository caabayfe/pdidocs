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
    const apiData = api.data.notify_conference_do_action.output;
    if (!apiData){
        return;
    }
    const data = apiData.result;
    if (!data || !api.data.fetch_conf_driver_uxf_actions.output) {
        return;
    }

    if (data.status === true) {
        if (data.action == notifyConfUtils.confActions.MUTE || data.action == notifyConfUtils.confActions.UNMUTE) {
            const participants = api.state.participants;
            for (let index in participants) {
                if (participants[index].sysId == api.context.session.user.sys_id && participants[index].notifyParticipantSysId == api.state.currentUserSelected) {
                    api.setState("selfMuteHide", data.action === notifyConfUtils.confActions.MUTE);
                    break;
                }
            }
        }
    }

    if (data.action == notifyConfUtils.confActions.KICK)
        api.setState("disableLeaveCallButton", false);
        
    const serviceProvider = api.state.confDetails.sp.name;
    const supportsPostActionsAndValidations = api.data.fetch_conf_driver_uxf_actions.output.supportsEventActionsAndIdentifiers;
    const confDriverActions = api.data.fetch_conf_driver_uxf_actions.output.confDriverActions;
    if (!serviceProvider || (typeof supportsPostActionsAndValidations === "undefined") || !confDriverActions)
        return;
    notifyConfUtils.handleConferenceActionResponse(api, helpers, serviceProvider, supportsPostActionsAndValidations, confDriverActions, false, data);
}
