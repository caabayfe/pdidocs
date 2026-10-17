/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {

    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE, MESSAGE_TYPE } = imports["global.DMClientConstants"]();
    const { FormValidator } = imports["global.DMCFormValidator"]();
    const { getFormattedMessage, UI_MESSAGE} = imports["global.DMClientMessageHandler"]();
    const { days, hours, minutes, seconds, name, isInvalid} = event.payload;

    const ageFieldValidity= deepClone(api.state[STATE.AGE_FIELD_VALIDITY]);

    if(name == "days_auto_rearchive"){
        ageFieldValidity.days = !isInvalid;
    }else if(name == "hours_auto_rearchive"){
        ageFieldValidity.hours = !isInvalid;
    }else if(name == "minutes_auto_rearchive"){
        ageFieldValidity.minutes = !isInvalid;
    }else if(name == "seconds_auto_rearchive"){
        ageFieldValidity.seconds = !isInvalid;
    }

    api.setState(STATE.AGE_FIELD_VALIDITY, ageFieldValidity);

    const archiveAgeFieldAlert = deepClone(api.state[STATE.ARCHIVE_DURATION_ALERT]);
    if(ageFieldValidity.days == false || ageFieldValidity.hours == false || ageFieldValidity.minutes == false || ageFieldValidity.seconds == false){
        archiveAgeFieldAlert.rearchive.hide = false,
        archiveAgeFieldAlert.rearchive.message = await getFormattedMessage(api, helpers, UI_MESSAGE.INVALID_DATE_FIELD);
        archiveAgeFieldAlert.rearchive.type = MESSAGE_TYPE.CRITICAL;
    }
    else {
        archiveAgeFieldAlert.rearchive.hide = true;
        archiveAgeFieldAlert.rearchive.message = "";
        archiveAgeFieldAlert.rearchive.type = "";
    }
    api.setState(STATE.ARCHIVE_DURATION_ALERT, archiveAgeFieldAlert);
}
