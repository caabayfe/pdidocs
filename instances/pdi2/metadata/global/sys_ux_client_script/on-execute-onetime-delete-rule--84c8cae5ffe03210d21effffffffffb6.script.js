/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {RULE_TYPE, COLUMNS} = imports["global.DMClientConstants"]();
    const {ruleData} = api.state;
    if(!ruleData) return;

    const ruleType = RULE_TYPE.ONETIME_DELETE;
    const ruleId = ruleData[ruleType] && ruleData[ruleType][COLUMNS.SYS_ID];
    if(!ruleId) return;

    api.data.dmc_rule_executor.execute({ruleId, ruleType});
    
}
