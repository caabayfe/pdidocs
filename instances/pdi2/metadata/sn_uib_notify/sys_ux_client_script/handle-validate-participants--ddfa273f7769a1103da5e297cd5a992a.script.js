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
    const participantsAndGroups = api.data.notify_validate_and_get_participants.output;
    const initialData = api.data.notify_conference_get_initial_data.output;
    const conferenceMessages = initialData.conferenceMessages || {};
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    let filteredRecommendations = api.state.recommendations;

    //need to remove duplicate participants when group is resovled to users we get this issue
    let filteredParticipantsAndGroups = participantsAndGroups;
    const selectedParticipants = [...api.state.selectedParticipantsAndGroups];

    let participants = [];
    let alerts = [];

    //If validation was done for group then show the message
    if (api.state.toBevalidatedParticipant && api.state.toBevalidatedParticipant.groupId.length > 0) {
        if (filteredParticipantsAndGroups.length == 0 || (filteredParticipantsAndGroups.length > 0 && (filteredParticipantsAndGroups[0].users.length == 0 && (!filteredParticipantsAndGroups[0].embeddedGroups || filteredParticipantsAndGroups[0].embeddedGroups.length == 0)))) {
            if (filteredParticipantsAndGroups[0] && filteredParticipantsAndGroups[0].message) {
                notifyConfUtils.showAlert(api, filteredParticipantsAndGroups[0].message.messageText, 'info');
            } else {
                const message = notifyConfUtils.formatMessage(conferenceMessages['The group {0} that you have selected does not have any users. Please select another group.'], [api.state.toBeValidatedParticipantName]);
                notifyConfUtils.showAlert(api, message, "info");
            }
            return;
        }
    }

    for (let index in filteredParticipantsAndGroups) {
        if (filteredParticipantsAndGroups[index].users) {
            //Its a group
            if (filteredParticipantsAndGroups[index].showGroupName) {
                let group = notifyConfUtils.buildParticipantObjectForMutilAhead(filteredParticipantsAndGroups[index], "group");
                participants.push(group);
            } else {
                for (let j = 0; j < filteredParticipantsAndGroups[index].users.length; j++) {
                    if (!notifyConfUtils.isValidParticipant(filteredParticipantsAndGroups[index].users[j], api)) {
                        alerts.push({
                            message: notifyConfUtils.formatMessage(conferenceMessages[`{0} in Group {1} could not be added as the selected participant is invalid`], [filteredParticipantsAndGroups[index].users[j].name, filteredParticipantsAndGroups[index].name]),
                            level: "critical"
                        });
                        continue;
                    }
                    if (notifyConfUtils.inSelectedParticipantsAndGroups(filteredParticipantsAndGroups[index].users[j].id, api)) {
                        continue;
                    }
                    const inRecommended = notifyConfUtils.inRecommendation(filteredParticipantsAndGroups[index].users[j].id, api);
                    if (inRecommended) {
                        participants.push(notifyConfUtils.convertPillToMutilAhead(inRecommended));
                        filteredRecommendations = notifyConfUtils.removeFromRecommendation(inRecommended, filteredRecommendations, api);
                        continue;
                    }
                    let user = notifyConfUtils.buildParticipantObjectForMutilAhead(filteredParticipantsAndGroups[index].users[j], "user");
                    participants.push(user);
                }
            }
            if (filteredParticipantsAndGroups[index].message) {
                notifyConfUtils.showAlert(api, filteredParticipantsAndGroups[index].message.messageText, 'info');
            }
        } else {
            //Its a user
            if (filteredParticipantsAndGroups[index].active) {
                notifyConfUtils.showAlert(api, notifyConfUtils.formatMessage(conferenceMessages["{0} is already in the conference call"], [filteredParticipantsAndGroups[index].name]), "info");
                break;
            }
            if (notifyConfUtils.isValidParticipant(filteredParticipantsAndGroups[index], api)) {
                let user = notifyConfUtils.buildParticipantObjectForMutilAhead(filteredParticipantsAndGroups[index], "user");
                participants.push(user);
            } else {
                notifyConfUtils.showAlert(api, notifyConfUtils.formatMessage(conferenceMessages[`{0} could not be added as the selected participant is invalid`], [filteredParticipantsAndGroups[index].name]), "critical");
                break;
            }
        }
    }
    api.setState("recommendations", [...filteredRecommendations]);
    const resultantSelectedParticipants = [...api.state.selectedParticipantsAndGroups, ...participants];
    api.setState("selectedParticipantsAndGroups", resultantSelectedParticipants);
    if (resultantSelectedParticipants.length > 0) {
        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.addParticipants || api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.startConference) {
            if (api.state.conferenceTitle && api.state.conferenceTitle.length > 0 && api.state.providerSelectors.length > 0) {
                api.setState("disableStart", false);
            }
        } else {
            if (api.state.message && api.state.message.length > 0 && api.state.providerSelectors.length > 0) {
                api.setState("disableStart", false);
            }
        }
    }
    notifyConfUtils.showMultipleAlerts(api, alerts);
}
