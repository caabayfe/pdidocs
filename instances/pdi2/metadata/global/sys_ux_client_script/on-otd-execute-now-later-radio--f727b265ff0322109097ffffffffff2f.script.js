/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    
    const {deepClone} = imports["global.DMClientScriptUtils"]();
    const {STATE, COLUMNS, OTD_SCHEDULE} = imports["global.DMClientConstants"]();

    const {ruleData, selectedRuleType:ruleType} = api.state;
    var stateValue = event.payload.value;
   
    var ruleObj = deepClone(ruleData);
    
    if(stateValue == OTD_SCHEDULE.SCHEDULE_LATER || stateValue == OTD_SCHEDULE.EXECUTE_UPON_CREATION) {
        ruleObj[ruleType][COLUMNS.RUN_AT] = "";
        const executionTime = deepClone(api.state[STATE.EXECUTION_TIME_ALERT]);
        executionTime.isValid = true;
        executionTime.message = "";
        api.setState(STATE.EXECUTION_TIME_ALERT, executionTime);
    }
    ruleObj[ruleType][OTD_SCHEDULE.SCHEDULE_TYPE] = stateValue;
    api.setState(STATE.RULE_DATA, ruleObj);
}
