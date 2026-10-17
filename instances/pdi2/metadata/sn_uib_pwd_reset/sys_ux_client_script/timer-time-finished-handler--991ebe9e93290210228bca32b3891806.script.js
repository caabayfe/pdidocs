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
    const sendSMSCodeButtonState = {...api.state.sendSMSCodeButtonState};
    const timerState = {...api.state.timerState};

    sendSMSCodeButtonState.disable = false;
    timerState.isHidden = true;
    timerState.start = false;

    api.setState("sendSMSCodeButtonState", sendSMSCodeButtonState);
    api.setState("timerState", timerState);
}
