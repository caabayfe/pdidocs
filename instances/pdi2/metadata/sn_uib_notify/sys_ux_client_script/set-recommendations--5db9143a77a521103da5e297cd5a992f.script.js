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
    const data = api.data.notify_conference_get_recommendations.output;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    if (!data) {
        notifyConfUtils.resetModal(api);
    }

    let recommendations = [];
    let loggedInParticipant;
    for (let index in data) {
        if (!data[index].id) {
            continue;
        }
        //for add sendSms modal do not add self user to recommendations as well
        if (api.context.props.type == notifyConfUtils.ALLOWED_PAGE_TYPES["sendSms"] && data[index].isLoggedIn) {
            continue;
        }
        const newRecommendation = notifyConfUtils.formatRecommendation(data[index]);
        if (newRecommendation.users) {
            for (let j in newRecommendation.users) {
                recommendations.push(newRecommendation.users[j]);
            }
        } else {
            if (data[index].isLoggedIn) {
                //Move to selected automatically
                if (!notifyConfUtils.isValidParticipant(data[index], api)) {
                    // If not valid then just move to recommended and skip auto move
                    recommendations.push(newRecommendation);
                    continue;
                }
                
                loggedInParticipant = notifyConfUtils.convertPillToMutilAhead(newRecommendation);
            } else {
                recommendations.push(newRecommendation);
            }
        }
    }

    api.setState("recommendations", recommendations);
    if (loggedInParticipant) api.setState("selectedParticipantsAndGroups", [loggedInParticipant]);
    else {
        api.setState("disableStart", true);
    }
    if (api.context.props.participants) {
        api.data.notify_fetch_participants.refresh();
    } else {
        api.setState("showLoader", false);
    }
}
