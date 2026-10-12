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
    const { STATE, RULE_TYPE } = imports["global.DMClientConstants"]();
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const ruleUpdateAlert = deepClone(api.state[STATE.RULE_UPDATE_ALERT]);
    ruleUpdateAlert.hide = true;
    api.setState(STATE.RULE_UPDATE_ALERT, ruleUpdateAlert);

}
