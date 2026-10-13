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
    const eventData = event.payload.data;
    if (event.elementId === "conference_calls_watcher" && event.name === "RECORD_WATCHER#MESSAGE_RECEIVED") {
        let confDetails = api.state.confDetails;
        if (eventData.action === "change" && eventData.operation === "update") {
            if (Array.isArray(eventData.changes) && eventData.changes.indexOf("active") !== -1) {
                const conferenceSysId = eventData.sys_id;
                if (conferenceSysId == confDetails.callID) {
                    if (eventData.record && eventData.record.active && eventData.record.active.value === "false") {
                        confDetails.active = false;
                        confDetails.callDuration = eventData.record.duration.value.split(" ")[1];
                        api.setState("confDetails", { ...confDetails
                        });
                        if (api.state.isLoading)
                            api.setState("isLoading", false);
                    }
                }
            }
        }
    } else if (event.elementId === "participant_session_watcher" && event.name === "RECORD_WATCHER#MESSAGE_RECEIVED") {
        let loggedInUserActiveParticipantSessionsPerCall = api.state.loggedInUserActiveParticipantSessionsPerCall;
        if (Array.isArray(eventData.changes) && eventData.changes.indexOf("active") !== -1) {
            const sessionID = eventData.sys_id;
            if (eventData.record && eventData.record.active && eventData.record.active.value === "true") {
                const callID = api.context.props.confId;
                if (!loggedInUserActiveParticipantSessionsPerCall[callID])
                    loggedInUserActiveParticipantSessionsPerCall[callID] = {};
                loggedInUserActiveParticipantSessionsPerCall[callID][sessionID] = null;
            } else {
                for (let callID in loggedInUserActiveParticipantSessionsPerCall) {
                    if (loggedInUserActiveParticipantSessionsPerCall[callID][sessionID] === null) {
                        delete loggedInUserActiveParticipantSessionsPerCall[callID][sessionID];
                    }
                }
            }
            const callID = api.context.props.confId;
            if (loggedInUserActiveParticipantSessionsPerCall[callID]) {
                api.setState("disableJoinCallButton", Object.keys(loggedInUserActiveParticipantSessionsPerCall[callID]).length !== 0);
            }
            api.setState("loggedInUserActiveParticipantSessionsPerCall", { ...loggedInUserActiveParticipantSessionsPerCall
            });
        }
    }
}
