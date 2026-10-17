/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { deepClone, getDateFromFormat, getUserDateTime, isEmpty, alerts} = imports["global.DMClientScriptUtils"]();
    const { RULE_TYPE, STATE, MESSAGE_TYPE } = imports["global.DMClientConstants"]();
    const {UI_MESSAGE} = imports["global.DMClientMessageHandler"]();
    const {selectedRuleType:ruleType, ruleData} = api.state;
    const {name, value, format} = event.payload;

    alerts.hideAlert(api, STATE.EXECUTION_TIME_ALERT);
    
    if(!isEmpty(value)) {
        const runDate = new Date(getDateFromFormat(value, format));
        const timeZoneOffset = api.context.session.user.timeZoneOffset;
        const now = getUserDateTime(timeZoneOffset);
    
        if(runDate <= now) {
            const message = await helpers.translate(UI_MESSAGE.SCHEDULE_TIME_PASSED);
            alerts.showError(api, STATE.EXECUTION_TIME_ALERT, message);
            return;
        } else {
            const message = await helpers.translate(UI_MESSAGE.EXECUTE_LATER_WARNING);
            alerts.showWarning(api, STATE.EXECUTION_TIME_ALERT, message);
        }    
    }   

    const ruleObj = deepClone(ruleData);
    ruleObj[ruleType][name] =  value;
    api.setState(STATE.RULE_DATA, ruleObj);

}
