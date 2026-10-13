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
    const initialData = api.data.notify_conference_get_initial_data.output;
    const conferenceMessages = initialData.conferenceMessages || {};

    // event gives the current seelected participants
    const currentParticipants = [...event.payload.value];
    const prevParticipants = [...api.state.selectedParticipantsAndGroups];
    const updatedParticipants = [...api.state.selectedParticipantsAndGroups];
    let updatedRecommendations = [...api.state.recommendations];

    const updateDataState = (participants, recommendations) => {
        api.setState('recommendations', recommendations);
        api.setState('selectedParticipantsAndGroups', participants);
        if (participants.length > 0) {
            if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.addParticipants || api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.startConference) {
                if (api.state.conferenceTitle && api.state.conferenceTitle.length > 0 && api.state.providerSelectors.length > 0) {
                    api.setState("disableStart", false);
                }
            } else {
                if (api.state.message && api.state.message.length > 0 && api.state.providerSelectors.length > 0) {
                    api.setState("disableStart", false);
                }
            }
        } else {
            api.setState("disableStart", true);
        }
    };

    if (currentParticipants.length <= prevParticipants.length) {
        //Get the participant who is removed from recommendations
        const removedParticipant = notifyConfUtils.findDifference(currentParticipants.sort(), prevParticipants.sort());
        let inRecommended = notifyConfUtils.inRecommendation(removedParticipant.id, api);
        if (inRecommended) {
            updatedRecommendations.push(inRecommended);
        }
        updateDataState(currentParticipants, updatedRecommendations);
    } else {
        // Handle when user is added from search list and in recommendations
        const addedParticipant = notifyConfUtils.findDifference(currentParticipants.sort(), prevParticipants.sort());
        let inRecommended = notifyConfUtils.inRecommendation(addedParticipant.id, api);
        if (inRecommended) {
            if (inRecommended.data.users) { // It's a sys user group
                if (inRecommended.data.showGroupName) {
                    let group = notifyConfUtils.buildParticipantObjectForMutilAhead(inRecommended.data, "group");
                    updatedParticipants.push(group);
                    updatedRecommendations = notifyConfUtils.removeFromRecommendation(inRecommended, api.state.recommendations, api);
                } else {
                    const alertMessages = [];
                    inRecommended.data.users.forEach(user => {
                        if (!notifyConfUtils.isValidParticipant(user, api)) {
                            alertMessages.push({
                                message: notifyConfUtils.formatMessage(conferenceMessages[`{0} in Group {1} could not be added as the selected participant is invalid`], [user.name, inRecommended.data.name]),
                                level: "critical"
                            });
                        } else if (notifyConfUtils.inSelectedParticipantsAndGroups(user.id, api)) {
                            // no operation;
                        } else {
                            updatedRecommendations = notifyConfUtils.removeFromRecommendation(user, updatedRecommendations, api);
                            updatedParticipants.push(notifyConfUtils.buildParticipantObjectForMutilAhead(user, "user"));
                        }
                    });
                    notifyConfUtils.showMultipleAlerts(api, alertMessages);
                }
            } else { // It's a sys user
                if (!notifyConfUtils.isValidParticipant(inRecommended.data, api)) {
                    notifyConfUtils.showAlert(api, notifyConfUtils.formatMessage(conferenceMessages[`{0} could not be added as the selected participant is invalid`], [addedParticipant.label]), "critical");
                } else {
                    updatedParticipants.push(notifyConfUtils.convertPillToMutilAhead(inRecommended));
                    updatedRecommendations = notifyConfUtils.removeFromRecommendation(inRecommended, api.state.recommendations, api);
                }
            }
            updateDataState(updatedParticipants, updatedRecommendations);
        } else {
            //Do not add participant if not valid and throw error
            let selectedParticipant = api.data.notify_conference_participant_search.output.participants.filter(participant => (addedParticipant.id === participant.sys_id || addedParticipant.id === participant.id))[0];
            if (!selectedParticipant) return;

            let data = notifyConfUtils.buildParticipantObjectForValidation(api, selectedParticipant);
            api.setState("toBevalidatedParticipant", data);
            api.setState("toBeValidatedParticipantName", selectedParticipant.name);
            // Reset the participants to prev state as we handle the new ones from data broker results
            updateDataState(prevParticipants, updatedRecommendations);
        }
    }
}
