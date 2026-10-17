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
    const selectedParticipants = api.state.selectedParticipantsAndGroups;
    if (selectedParticipants.length == 0){
        return;
    }
    let inRecommendedParticipants = [];
    for (let index in selectedParticipants) {
        let inRecommended = notifyConfUtils.inRecommendation(selectedParticipants[index].id, api);
        if (inRecommended) inRecommendedParticipants.push(inRecommended);
    }
    if (inRecommendedParticipants.length > 0) {
        api.setState("recommendations", [...api.state.recommendations, ...inRecommendedParticipants]);
    }
    api.setState("selectedParticipantsAndGroups", []);
    api.setState("disableStart", true);
}
