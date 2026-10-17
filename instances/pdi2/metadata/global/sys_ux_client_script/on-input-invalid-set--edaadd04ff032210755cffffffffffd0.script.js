/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { RULE_TYPE, STATE, MESSAGE_TYPE } = imports["global.DMClientConstants"]();
    const {selectedRuleType:ruleType, ruleData} = api.state;
    if(!ruleType) return;
    const {name, fieldValue} = event.payload;
    
    const ruleObj = deepClone(ruleData);
    ruleObj[ruleType][name] =  fieldValue;
    api.setState(STATE.RULE_DATA, ruleObj);
    
}
