/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {STATE} = imports["global.DMClientConstants"]();
    const {deepClone} = imports["global.DMClientScriptUtils"]();
    const {selectedRuleType, ruleData} = api.state;
    const {item, value} = event.payload;
    const {id, label, actionSource} = value;
    const ruleObj = deepClone(ruleData);
    if(actionSource == "input") {
        ruleObj[selectedRuleType][item.name] = label;
    }else if(actionSource == "select") {
        ruleObj[selectedRuleType][item.name] = id;
    }
    api.setState(STATE.RULE_DATA, ruleObj);
}
