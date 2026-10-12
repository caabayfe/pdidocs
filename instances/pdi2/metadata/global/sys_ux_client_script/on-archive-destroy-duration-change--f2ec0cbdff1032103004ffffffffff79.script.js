/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE, MESSAGE_TYPE, RULE_TYPE } = imports["global.DMClientConstants"]();
    const { getFormattedMessage, UI_MESSAGE} = imports["global.DMClientMessageHandler"]();
    
    async function showError() {
        const alert = deepClone(api.state[STATE.DESTROY_DURATION_ALERT]);
        alert.isValid = false;
        alert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.INVALID_DATE_FIELD);
        alert.type = MESSAGE_TYPE.CRITICAL;
        api.setState(STATE.DESTROY_DURATION_ALERT, alert);
    }
    function hideError() {
        const alert = deepClone(api.state[STATE.DESTROY_DURATION_ALERT]);
        alert.isValid = true;
        alert.message = "";
        api.setState(STATE.DESTROY_DURATION_ALERT, alert);
    }
    
    const destroyValidity = deepClone(api.state[STATE.DESTROY_DURATION_VALIDITY]);
    const { days, hours, minutes, seconds, name, isInvalid} = event.payload;

    if (name == "days_destroy_duration") {
        destroyValidity["days"] = !isInvalid;
    } else if (name == "hours_destroy_duration") {
        destroyValidity["hours"] = !isInvalid;
    } else if (name == "minutes_destroy_duration") {
        destroyValidity["minutes"] = !isInvalid;
    } else if (name == "seconds_destroy_duration") {
        destroyValidity["seconds"] = !isInvalid;
    }
    api.setState(STATE.DESTROY_DURATION_VALIDITY, destroyValidity);

    // If all fields are valid hide any error message
    if (destroyValidity.days && destroyValidity.hours && destroyValidity.minutes && destroyValidity.seconds) {
        hideError();
    } else {
        showError();
    }
}
