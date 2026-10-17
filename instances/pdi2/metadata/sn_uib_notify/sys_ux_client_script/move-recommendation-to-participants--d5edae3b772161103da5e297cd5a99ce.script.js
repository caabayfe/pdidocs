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
    const pillValue = event.payload.pillValue;
    if (!pillValue) return;
    const recommendations = api.state.recommendations;
    let filteredRecommendations = [];
    let selectedRecommendation;
    for (let index in recommendations) {
        if (pillValue != recommendations[index].id) {
            filteredRecommendations.push(recommendations[index]);
            continue;
        };
        var obj = notifyConfUtils.convertPillToMutilAhead(recommendations[index]);
        if (!obj.data.avatarProps) {
            obj.icon = notifyConfUtils.GROUP_ICON;
        }
        if (!recommendations[index].data.showGroupName && !notifyConfUtils.isValidParticipant(recommendations[index].data, api)) {
            let message = notifyConfUtils.formatMessage(conferenceMessages[`{0} could not be added as the selected participant is invalid`], [recommendations[index].data.name]);
            notifyConfUtils.showAlert(api, message, "critical");
            return;
        }
        selectedRecommendation = obj;
    }

    if (selectedRecommendation) {
        api.setState("selectedParticipantsAndGroups", [...api.state.selectedParticipantsAndGroups, selectedRecommendation]);
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
    }
    api.setState("recommendations", filteredRecommendations);
}
