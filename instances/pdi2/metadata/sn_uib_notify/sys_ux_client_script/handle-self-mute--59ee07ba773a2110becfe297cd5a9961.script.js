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
    if (!api.data.get_conference_initial_details.output)
        return;

    const confData = api.data.get_conference_initial_details.output.conferenceTemplate;
    if (api.state.confDetails && api.state.confDetails.sp)
        confData.serviceProvider = api.state.confDetails.sp.name;
    confData.confId = api.context.props.confId;

    const participants = api.state.participants;
    for (let index in participants){
        if (participants[index].sysId == api.context.session.user.sys_id){
            confData.items.push({notifyParticipantId:participants[index].notifyParticipantSysId});
            break;
        }
    }
    const action = event.elementId == "mute" ? notifyConfUtils.confActions.MUTE : notifyConfUtils.confActions.UNMUTE;
    api.setState("conferenceDoAction", {
        action: action,
        confData: JSON.stringify(confData),
        timestamp: new Date().getTime()
    });
}
