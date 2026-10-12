/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {deepClone, isEmpty} = imports["global.DMClientScriptUtils"]();
    const {STATE, RULE_TYPE, COLUMNS} = imports["global.DMClientConstants"]();

    const {ruleData} = api.state;
    if(ruleData[RULE_TYPE.ONETIME_DELETE][COLUMNS.RUN_AT]) {
        const rule = ruleData[RULE_TYPE.ONETIME_DELETE];
        if(rule && rule[COLUMNS.RUN_AT]) {
            api.data.update_and_schedule_one_time_delete_rule.execute({rule: rule});
        }
    }
}
