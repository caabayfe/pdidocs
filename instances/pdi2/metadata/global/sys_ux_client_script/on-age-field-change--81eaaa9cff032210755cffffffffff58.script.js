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
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE, MESSAGE_TYPE, RULE_TYPE } = imports["global.DMClientConstants"]();
    const { FormValidator } = imports["global.DMCFormValidator"]();
    const { getFormattedMessage, UI_MESSAGE} = imports["global.DMClientMessageHandler"]();
    const { days, hours, minutes, seconds, name, isInvalid} = event.payload;

    const ageFieldValidity= deepClone(api.state[STATE.AGE_FIELD_VALIDITY]);

    if (["days", "hours", "minutes", "seconds"].includes(name)) {
        ageFieldValidity[name] = !isInvalid;
    }

    api.setState(STATE.AGE_FIELD_VALIDITY, ageFieldValidity);

    const ageFieldAlert = deepClone(api.state[STATE.AGE_FIELD_ALERT]);
    if(ageFieldValidity.days == false || ageFieldValidity.hours == false || ageFieldValidity.minutes == false || ageFieldValidity.seconds == false){
        ageFieldAlert.hide = false,
        ageFieldAlert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.INVALID_DATE_FIELD);
        ageFieldAlert.type = MESSAGE_TYPE.CRITICAL;
    }
    else if (FormValidator.isAgeLessThan24Hours(0, days, hours, minutes, seconds)) {
        ageFieldAlert.hide = false,
        ageFieldAlert.message = await getFormattedMessage(api, helpers, UI_MESSAGE.AGE_LESS_THAN_24_HOURS);
        ageFieldAlert.type = MESSAGE_TYPE.INFO;
    } else {
        ageFieldAlert.hide = true;
        ageFieldAlert.message = "";
        ageFieldAlert.type = "";
    }
    api.setState(STATE.AGE_FIELD_ALERT, ageFieldAlert);

}
