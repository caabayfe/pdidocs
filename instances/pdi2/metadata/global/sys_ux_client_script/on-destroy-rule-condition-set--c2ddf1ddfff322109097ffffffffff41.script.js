/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var ruleType = api.state.selectedRuleType;
    var queryPayload = event.payload;
    if (!queryPayload.partial) {
        var ruleData = api.state.ruleData;
        ruleData[ruleType]["destroy_rule_condition"] = queryPayload.encodedQuery;
        api.setState("ruleData", ruleData);
    }
}
