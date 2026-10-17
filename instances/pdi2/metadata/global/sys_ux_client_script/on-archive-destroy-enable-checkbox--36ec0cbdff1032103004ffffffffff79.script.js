/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { RULE_TYPE, STATE, MESSAGE_TYPE, EVENT, COLUMNS } = imports["global.DMClientConstants"]();
    const {selectedRuleType: ruleType, ruleData} = api.state;
    if(!ruleType || !ruleData) return;
    const {name, value} = event.payload;
    
    const ruleObj = deepClone(api.state[STATE.RULE_DATA]);
    ruleObj[ruleType][name] = value;
    api.setState(STATE.RULE_DATA, ruleObj);
    
    if(!value) {
        if(ruleObj[RULE_TYPE.ARCHIVE][COLUMNS.DESTROY_RULE]) {
            api.emit(EVENT.OPEN_DESTROY_ARCHIVE_POPUP, {});
            return;
        }
    }

}
