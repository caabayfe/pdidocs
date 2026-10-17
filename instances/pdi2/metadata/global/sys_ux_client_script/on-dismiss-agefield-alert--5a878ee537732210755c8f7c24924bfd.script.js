/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE } = imports["global.DMClientConstants"]();
    const ageFieldAlert = deepClone(api.state[STATE.AGE_FIELD_ALERT]); 
    ageFieldAlert.hide = true;
    api.setState(STATE.AGE_FIELD_ALERT, ageFieldAlert);
}
