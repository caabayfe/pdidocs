/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {deepClone} = imports["global.DMClientScriptUtils"]();
    const {selectedRuleType, ruleData} = api.state;
    const {name, fieldValue} = event.payload;
    const ruleObj = deepClone(ruleData);
    ruleObj[selectedRuleType][name] = fieldValue;
    api.setState("ruleData", ruleObj);
}
