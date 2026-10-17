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
    if (event.name == "RECORD_WATCHER#MESSAGE_RECEIVED") {
        if (event.payload && event.payload.data) {
            if (event.payload.data.operation == "update") {
                var notifyParticipantSysid = event.payload.data.sys_id;
                var participantState = api.state.participants;
                for (var i = 0; i < participantState.length; i++) {
                    if (participantState[i].notifyParticipantSysId == notifyParticipantSysid) {
                        var changes = event.payload.data.changes;
                        for (var j = 0; j < changes.length; j++) {
                            participantState[i][changes[j]] = event.payload.data.record[changes[j]].value === "true";
                            if (participantState[i].sysId === api.context.session.user.sys_id) {
                                api.data.get_loggedin_user_actions.refresh();
                                if (changes[j] === "muted")
                                    api.setState("selfMuteHide", participantState[i][changes[j]]);
                            }
                        }
                    }
                }
                for (var i = 0; i < event.payload.data.changes.length; i++) {
                    if (event.payload.data.changes[i] == "active") {
                        var timestamp = new Date().getTime();
                        if (api.state.timestamp == -1 || timestamp - api.state.timestamp > 200) {
                            const time = new Date().getTime();
                            api.setState("timestamp", time);
                            helpers.timing.setTimeout(() => {
                                api.data.get_notify_conference_participants.refresh();
                            }, 200);
                        }
                        break;
                    }
                }
                api.setState("participants", [...participantState]);
            }
            if (event.payload.data.operation == "insert") {
                var currTimeStamp = new Date().getTime();
                var lastParticipantsRefreshStartTime = new Date(api.state.participantsRefreshStartTime).getTime();

                if (currTimeStamp - lastParticipantsRefreshStartTime > notifyConfUtils.REFRESH_PARTICIPANTS_INTERVAL_TIMEOUT_MS) {
                    var intervalId = helpers.timing.setInterval((intervalStartTime = currTimeStamp) => {
                        api.data.get_notify_conference_participants.refresh();
                        if (new Date().getTime() - intervalStartTime > notifyConfUtils.REFRESH_PARTICIPANTS_INTERVAL_TIMEOUT_MS) {
                            helpers.timing.clearInterval(intervalId);
                        }
                    }, notifyConfUtils.PARTICIPANTS_DATA_REFRESH_INTERVAL_MS);
                    api.setState('participantsRefreshStartTime', currTimeStamp);
                } else {
                    // no operation
                }
            }
        }
    }
}
