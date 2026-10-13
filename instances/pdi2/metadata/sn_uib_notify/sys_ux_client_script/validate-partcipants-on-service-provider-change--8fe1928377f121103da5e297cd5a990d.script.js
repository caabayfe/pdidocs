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
    const selectedProvider = event.payload.item;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const selectedParticipants = api.state.selectedParticipantsAndGroups;
    const initialData = api.data.notify_conference_get_initial_data.output;
    const conferenceMessages = initialData.conferenceMessages || {};
    let alerts = [];
    let filteredParticipants = [];

    if (notifyConfUtils.isProviderActionSupported(initialData.serviceProviderCaps[selectedProvider.provider], "title")){
        api.setState("disableConferenceTitle", false);
    }
    else {
        api.setState("disableConferenceTitle", true);
    }

    if (selectedParticipants.length == 0) {
        return;
    }
    let inRecommendedParticipants = [];
    for (let index in selectedParticipants) {
        if (!selectedParticipants[index].data.showGroupName && !notifyConfUtils.isValidParticipant(selectedParticipants[index].data, api, selectedProvider.provider)) {
            let inRecommended = notifyConfUtils.inRecommendation(selectedParticipants[index].id, api);
            if (inRecommended) inRecommendedParticipants.push(inRecommended);
            let message = notifyConfUtils.formatMessage(conferenceMessages['{0} could not be added as the selected participant is invalid. Hence removed from the list.'], [selectedParticipants[index].data.name]);
            alerts.push({
                message: message,
                level: "warning"
            });
            continue;
        } else {
            filteredParticipants.push(selectedParticipants[index]);
        }
    }
    if (inRecommendedParticipants.length > 0) {
        api.setState("recommendations", [...api.state.recommendations, ...inRecommendedParticipants]);
    }
    api.setState("selectedParticipantsAndGroups", filteredParticipants);
    if (filteredParticipants.length == 0){
        api.setState("disableStart", true);
    }
    notifyConfUtils.showMultipleAlerts(api, alerts);
}
