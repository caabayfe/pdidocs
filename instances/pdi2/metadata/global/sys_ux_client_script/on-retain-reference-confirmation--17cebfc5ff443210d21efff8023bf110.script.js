/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const { deepClone } = imports["global.DMClientScriptUtils"]();
    const { STATE, RULE_TYPE, COLUMNS } = imports["global.DMClientConstants"]();

    var ruleData = api.state.ruleData;
    var tableName = api.context.props.tableName;
    ruleData[RULE_TYPE.ARCHIVE][COLUMNS.RETAIN_REFERENCES] = true;

    var dmRuleObj = {
        dmRule: ruleData,
        tableName: tableName
    };
    api.setState(STATE.RETAIN_REF_CHECKBOX_DISABLED, true);
    api.setState(STATE.RULE_DATA, deepClone(ruleData));

    const ageFieldValidity = deepClone(api.state[STATE.AGE_FIELD_VALIDITY]); 
    if(ageFieldValidity.years == false || ageFieldValidity.days == false || ageFieldValidity.hours == false){
        return;
    }
    
    api.data.create_data_management_rule.execute(dmRuleObj);
}
