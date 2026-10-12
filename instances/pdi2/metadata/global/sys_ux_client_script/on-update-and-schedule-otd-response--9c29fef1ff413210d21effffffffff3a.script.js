/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({api, event, helpers, imports}) {
    const {STATE, STATUS, RULE_TYPE, MESSAGE_TYPE} = imports["global.DMClientConstants"]();
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { UI_MESSAGE } = imports["global.DMClientMessageHandler"]();

    const {sysID, status, messages} = (event.payload.data && event.payload.data.output) || {};

    
    function showError(stateVarName, message) {
        const uiElement = deepClone(api.state[stateVarName]);
        uiElement.message = message;
        uiElement.type = MESSAGE_TYPE.CRITICAL;
        uiElement.hide = false;
        api.setState(stateVarName, uiElement);
    }

    function showSuccess(stateVarName, message) {
        const uiElement = deepClone(api.state[stateVarName]);
        uiElement.message = message;
        uiElement.type = MESSAGE_TYPE.POSITIVE;
        uiElement.hide = false;
        api.setState(stateVarName, uiElement);
    }

    if(status == STATUS.SUCCESS) {
        const message = await helpers.translate(UI_MESSAGE.RULE_UPDATE_SUCCESS);
        showSuccess(STATE.RULE_UPDATE_ALERT, message);
    } else {
        const message = await helpers.translate(UI_MESSAGE.RULE_INVALID_UPDATE);
        showError(STATE.RULE_UPDATE_ALERT, message);
    }
}
