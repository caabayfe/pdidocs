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
    const data = api.data.notify_conference_participant_search.output;
    const notifyConfUtils = imports["sn_uib_notify.NotifyConferenceUxfClientUtil"]();
    if (!data.participants) return;

    let partipantsItems = [];
    for (let i = 0; i < data.participants.length; i++) {
        let particpant = notifyConfUtils.buildParticipantObjectForSearchList(data.participants[i]);
        partipantsItems.push(particpant);
    };
    api.setState("participantsAndGroups", partipantsItems);
}
