/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var tableName = api.context.props.tableName;
    var ruleType = api.data.rule_management_dmc.selectedRuleType;
    var selectedTabId = api.data.rule_management_dmc.selectedTabId;
    if(!selectedTabId || !ruleType) return '';

    var ruleTypeNameMap = {
        "table_cleaner": "Cleanup",
        "archive": "Archive",
        "onetime_delete": "One-time delete"
    };

    var selectedTabName = selectedTabId.split(".")[1];
    if(selectedTabName == "basic_information") {
        return helpers.translateSync("Create rule");
    } 
    else if(selectedTabName == "view_summary") {
        return helpers.translateSync("Summary of") + " " + helpers.translateSync(ruleTypeNameMap[ruleType]) + " " + helpers.translateSync("rule") + " [" + tableName + "]";
    }
    else return helpers.translateSync("New") + " " + helpers.translateSync(ruleTypeNameMap[ruleType]) + " " + helpers.translateSync("rule") + " [" + tableName + "]";

}
