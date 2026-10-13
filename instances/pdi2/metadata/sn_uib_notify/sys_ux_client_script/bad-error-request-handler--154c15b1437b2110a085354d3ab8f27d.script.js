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
    var result = [];
    if (event.payload && event.payload.errors && event.payload.errors.length > 0)
        result.push({
            level: "critical",
            message: event.payload.errors[0].message
        });
    notifyConfUtils.showMultipleAlerts(api, result);

    if(api.state.conferenceDoAction &&  api.state.conferenceDoAction.action) {
        const action = api.state.conferenceDoAction.action;
        if (action == notifyConfUtils.confActions.KICK) {
            const participants = api.state.participants;
            for (let index in participants) {
                if (participants[index].sysId == api.context.session.user.sys_id && participants[index].notifyParticipantSysId == api.state.currentUserSelected) {
                    api.setState("disableLeaveCallButton", false);
                    break;
                }
            }
        } else if (action == notifyConfUtils.confActions.END) {
            api.setState("isLoading", false);
        }
    }
}
