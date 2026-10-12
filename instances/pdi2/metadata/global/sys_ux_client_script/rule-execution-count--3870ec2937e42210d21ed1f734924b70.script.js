/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var rows = api.data.recent_rules_activities_on_table.output || [];
    
    // If there is a filter on RuleType, apply it
    var ruleTypeFilter = api.state.ruleTypeSelection;
    if (ruleTypeFilter && ruleTypeFilter !== 'ALL_TYPES') {
        rows = rows.filter(row => row.ruleType == ruleTypeFilter);
    }

    api.setState("ruleActivityCount", rows.length);
}
