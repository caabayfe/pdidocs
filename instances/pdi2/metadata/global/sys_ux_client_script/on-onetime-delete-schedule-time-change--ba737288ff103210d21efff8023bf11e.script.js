/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {deepClone} = imports["global.DMClientScriptUtils"]();
    const {STATE, MESSAGE_TYPE } = imports["global.DMClientConstants"]();
    const {UI_MESSAGE, getFormattedMessage} = imports["global.DMClientMessageHandler"]();

    const {name, fieldValue, format, type, isInvalid} = event.payload;
    if(isInvalid) {
        const message = await getFormattedMessage(api, helpers, UI_MESSAGE.INVALID_TARGET_TIME);
        const executionTime = deepClone(api.state[STATE.EXECUTION_TIME_ALERT]);
        executionTime.isValid = false;
        executionTime.message = message;
        executionTime.type = MESSAGE_TYPE.CRITICAL;
        api.setState(STATE.EXECUTION_TIME_ALERT, executionTime);
    }
}
