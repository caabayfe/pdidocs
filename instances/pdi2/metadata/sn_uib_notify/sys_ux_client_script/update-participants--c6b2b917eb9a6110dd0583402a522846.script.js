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
    if (api.state.isLoading && api.state.allContentLoaded) {
        api.setState("isLoading", false);
        api.setState("allContentLoaded", false);
    }
    const participants = api.data.get_notify_conference_participants.output.participants;
    const isCallActive = api.data.get_notify_conference_participants.output.isActive;
    const DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD = notifyConfUtils.DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD;
    var allParticipantsArrays = {};
    if (!participants) {
        return;
    }
    var joinedParticipants = [];
    if (participants.length > 0) {
        var declinedparticipants = [];
        let participantsInvited = [];
        var loadMoreCount = api.state.loadMoreCount;

        if (isCallActive) {
            for (let index in participants) {
                if (participants[index].active) {
                    joinedParticipants.push(participants[index]);
                } else {
                    participantsInvited.push(participants[index]);
                }
            }
        } else {
            for (let index in participants) {
                if (participants[index].hasJoined) {
                    joinedParticipants.push(participants[index]);
                } else {
                    participantsInvited.push(participants[index]);
                }
            }
        }
        //Sort the participants by created timestamp of participant session record
        joinedParticipants.sort(function(a, b) {
            var keyA = a.joinedTimeEpoch,
                keyB = b.joinedTimeEpoch;
            if (keyA > keyB) return -1;
            if (keyA < keyB) return 1;
            return 0;
        });

        allParticipantsArrays.participants = [...joinedParticipants];
        allParticipantsArrays.participantsInvited = [...participantsInvited];
        api.setState("allParticipantsArrays", allParticipantsArrays);
        api.setState("participants", [...joinedParticipants]);
        api.setState("participantInvited", [...participantsInvited]);
        api.setState("showLoadMore", false);
        if (allParticipantsArrays.participantsInvited.length > (DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD * loadMoreCount)) {
            var numberOfCardsToAppend = (DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD * loadMoreCount);
            participantsInvited = allParticipantsArrays.participantsInvited.slice(0, numberOfCardsToAppend);
            api.setState("showLoadMore", true);
            api.setState("participantInvited", [...participantsInvited]);
        }
    }

    let isLoggedInUserInParticipant = false;
    for (let index in joinedParticipants) {
        if (joinedParticipants[index].sysId == api.context.session.user.sys_id) {
            isLoggedInUserInParticipant = true;
            if (joinedParticipants[index].muted) {
                api.setState("selfMuteHide", true);
            } else {
                api.setState("selfMuteHide", false);
            }
            // For initial state set the loggedin user as currentSelected
            api.setState("currentUserSelected", joinedParticipants[index].notifyParticipantSysId);
            break;
        }
    }
    api.setState("isLoggedInUserActiveParticipant", isLoggedInUserInParticipant);
    if (api.state.disableJoinCallButton && isLoggedInUserInParticipant) {
        api.setState("disableJoinCallButton", false);
    }
}
