/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    const data = api.data.get_conference_initial_details.output;
    if (!data) {
        return;
    }

    const conferenceDetails = data.conferenceDetails;
    if (!conferenceDetails) {
        return;
    }
    const conferenceCallDetails = conferenceDetails.call;
    conferenceCallDetails.startTime = notifyConfUtils.formatDateTime(conferenceCallDetails.startTime);
    api.setState('confDetails', conferenceCallDetails);
    api.setState('loggedInUserActiveParticipantSessionsPerCall', conferenceDetails.loggedInUserActiveParticipantSessionsPerCall);
    api.setState('disableJoinCallButton', conferenceCallDetails.disableJoinConference);

    const loggedInUserTriggerActions = {
        "canEndCall": conferenceCallDetails.canLoggedInUserEndCall,
        "canLeaveCall": conferenceCallDetails.canLoggedInUserLeaveCall,
        "canKickOthers": conferenceCallDetails.canLoggedInUserKickOthers,
        "canAddParticipants": conferenceCallDetails.canLoggedInUserAddParticipants,
        "canReinitiateCall": conferenceCallDetails.canLoggedInUserReinitiateCall,
        "canMute": conferenceCallDetails.canLoggedInUserMute,
        "canUnmute": conferenceCallDetails.canLoggedInUserUnmute,
        "canMultiMute": conferenceCallDetails.canLoggedInUserMultiMute
    };

    api.setState('loggedInUserTriggerActions', loggedInUserTriggerActions);

    let invite = conferenceCallDetails.invite;

    if (conferenceCallDetails.sp.name !== notifyConfUtils.TELEPHONY_PROVIDER) {
        if (conferenceCallDetails.invite) {
            api.setState("meetingLink", conferenceCallDetails.invite);
        }
    } else {
        let notifyNumber = await helpers.translate("Dial in number: {0}", conferenceCallDetails.notifyNumber);
        let accessCode = await helpers.translate("Access code: {0}", conferenceCallDetails.conferenceCode);
        api.setState('meetingId', notifyNumber);
        api.setState('accessCode', accessCode);
    }

    if (api.state.timerIntervalId)
        helpers.timing.clearInterval(api.state.timerIntervalId);

    const duration = notifyConfUtils.getDuration(conferenceCallDetails.startTimeEpoch);
    api.setState("conferenceDuration", duration);
    const timerIntervalId = helpers.timing.setInterval(() => {
        const duration = notifyConfUtils.getDuration(conferenceCallDetails.startTimeEpoch);
        api.setState("conferenceDuration", duration);
    }, 1000);
    api.setState("timerIntervalId", timerIntervalId);

    let actions = [];

    const providerCaps = data.serviceProviderCaps;
    if (providerCaps) {
        var provider = conferenceCallDetails.sp.name;
        var caps = providerCaps[provider];
        var actionToDisplay = await notifyConfUtils.supportedActionsMap(helpers);
        for (let key in caps) {
            if (actionToDisplay[key]) {
                switch (actionToDisplay[key].value) {
                    case 'kick':
                        if (conferenceCallDetails.canLoggedInUserKickOthers) {
                            actions.push({
                                label: actionToDisplay[key].displayValue,
                                id: key
                            });
                        }
                        break;
                    case 'mute':
                        if (conferenceCallDetails.canLoggedInUserMute) {
                            actions.push({
                                label: actionToDisplay[key].displayValue,
                                id: key
                            });
                        }
                        break;
                    case 'unmute':
                        if (conferenceCallDetails.canLoggedInUserUnmute) {
                            actions.push({
                                label: actionToDisplay[key].displayValue,
                                id: key
                            });
                        }
                        break;
                    default:
                }
            }
        }
    }

    api.setState("allowedActions", actions);
    api.setState("actionsToDisplay", actions);

    if (conferenceCallDetails.active) {
        api.setState("subscribeAmb", true);
    }
}
