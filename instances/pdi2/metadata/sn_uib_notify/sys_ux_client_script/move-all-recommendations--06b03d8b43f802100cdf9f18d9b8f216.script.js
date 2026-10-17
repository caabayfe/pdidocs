/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const initialData = api.data.notify_conference_get_initial_data.output;
    const conferenceMessages = initialData.conferenceMessages || {};
    
    const recommendations = api.state.recommendations;
    let alertMessages = [];
    let validRecommendations = [];
    let invalidRecommendations = [];
    for (let index in recommendations) {
        var obj = notifyConfUtils.convertPillToMutilAhead(recommendations[index]);
        if (!obj.data.avatarProps) {
            obj.icon = notifyConfUtils.GROUP_ICON;
        }
        if (!recommendations[index].data.showGroupName && !notifyConfUtils.isValidParticipant(recommendations[index].data, api)) {
            alertMessages.push({
                level: 'critical',
                message: notifyConfUtils.formatMessage(conferenceMessages[`{0} could not be added as the selected participant is invalid`], [recommendations[index].data.name])
            });
            invalidRecommendations.push(recommendations[index]);
        } else {
            validRecommendations.push(obj);
        }
    }

    if (validRecommendations.length > 0) {
        api.setState("selectedParticipantsAndGroups", [...api.state.selectedParticipantsAndGroups, ...validRecommendations]);
        //Check title if empty to set disable start
        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.addParticipants || api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES.startConference) {
            if (api.state.conferenceTitle && api.state.conferenceTitle.length > 0 && api.state.providerSelectors.length > 0) {
                api.setState("disableStart", false);
            }
        } else {
            if (api.state.message && api.state.message.length > 0 && api.state.providerSelectors.length > 0) {
                api.setState("disableStart", false);
            }
        }
        api.setState("recommendations", invalidRecommendations);
    }
    if (alertMessages.length > 0) notifyConfUtils.showMultipleAlerts(api, alertMessages);
}
