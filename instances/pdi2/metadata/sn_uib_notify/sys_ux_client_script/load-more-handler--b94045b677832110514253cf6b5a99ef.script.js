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
    var allParticipantsArrays = api.state.allParticipantsArrays;
    const DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD = notifyConfUtils.DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD;
    var numberOfParticipantsToAppend = 0;
    var participantsInvited = api.state.participantInvited;
    var participants = api.state.participants;
    var loadMoreCount = api.state.loadMoreCount + 1;
    api.setState("loadMoreCount", loadMoreCount);

    if (allParticipantsArrays.participantsInvited.length - participantsInvited.length > DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD) {
        numberOfParticipantsToAppend = DEFAULT_NO_OF_PARTICIPANTS_TO_LOAD;
        api.setState("showLoadMore", true);
    } else {
        numberOfParticipantsToAppend = allParticipantsArrays.participantsInvited.length - participantsInvited.length;
        api.setState("showLoadMore", false);
    }
    participantsInvited = allParticipantsArrays.participantsInvited.slice(0, participantsInvited.length + numberOfParticipantsToAppend);
    api.setState("participantInvited", participantsInvited);
}
