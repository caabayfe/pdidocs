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
    const participantsData = api.data.notify_fetch_participants.output;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    let filteredRecommendations = api.state.recommendations;

    let filteredParticipants = participantsData;
    const selectedParticipants = [...api.state.selectedParticipantsAndGroups];

    let participants = [];

    for (let index in filteredParticipants) {
        if (notifyConfUtils.isValidParticipant(filteredParticipants[index], api)) {
            if (notifyConfUtils.inSelectedParticipantsAndGroups(filteredParticipants[index].id, api)) {
                continue;
            }
            const inRecommended = notifyConfUtils.inRecommendation(filteredParticipants[index].id, api);
            if (inRecommended) {
                participants.push(notifyConfUtils.convertPillToMutilAhead(inRecommended));
                filteredRecommendations = notifyConfUtils.removeFromRecommendation(inRecommended, filteredRecommendations, api);
                continue;
            }
            let user = notifyConfUtils.buildParticipantObjectForMutilAhead(filteredParticipants[index], "user");
            participants.push(user);
        } else {
            //Do not show error message, gracefully continue
            continue;
        }
    }
    api.setState("recommendations", [...filteredRecommendations]);
    const resultantSelectedParticipants = [...api.state.selectedParticipantsAndGroups, ...participants];
    api.setState("selectedParticipantsAndGroups", resultantSelectedParticipants);
    if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.sendSms){
        api.setState("disableStart", resultantSelectedParticipants.length === 0 || (api.state.message.length ==0));
    }
    else {
        api.setState("disableStart", resultantSelectedParticipants.length === 0);
    }
    api.setState("showLoader", false);
}
