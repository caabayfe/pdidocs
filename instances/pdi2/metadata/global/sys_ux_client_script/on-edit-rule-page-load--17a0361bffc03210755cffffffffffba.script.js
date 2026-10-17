/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { STATE, RULE_TYPE } = imports["global.DMClientConstants"]();
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    let ruleType = api.context.props.ruleType.toLowerCase();
    if(ruleType == "one_time_delete") {
        ruleType = RULE_TYPE.ONETIME_DELETE;
    }
    
    api.setState(STATE.SELECTED_RULE_TYPE, ruleType);
    api.setState(STATE.SELECTED_TAB_ID, ruleType + "." + ruleType + "_edit");
    api.setState(STATE.IS_EDIT_FLOW, true);
}
