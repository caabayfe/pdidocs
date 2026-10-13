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
    let notifyTemplate = {
        items: [],
        serviceProvider: "",
        confId: ""
    };
    const action = event.payload.item.id;
    notifyTemplate.serviceProvider = api.state.confDetails.sp.name;
    notifyTemplate.confId = api.context.props.confId;
    notifyTemplate.items.push({
        notifyParticipantId: api.state.currentUserSelected
    });

    if (action == notifyConfUtils.confActions.KICK) {
        const participants = api.state.participants;
        for (let index in participants) {
            if (participants[index].sysId == api.context.session.user.sys_id && participants[index].notifyParticipantSysId == api.state.currentUserSelected) {
                api.setState("disableLeaveCallButton", true);
                break;
            }
        }
    }

    api.setState("conferenceDoAction", {
        action: action,
        confData: JSON.stringify(notifyTemplate),
        timestamp: new Date().getTime()
    });
}
