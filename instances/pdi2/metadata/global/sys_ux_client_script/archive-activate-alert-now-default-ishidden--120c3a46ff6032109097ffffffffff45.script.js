/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.data.rule_management_dmc.selectedRuleType != "archive") return true;
    var conditions = api.data.rule_management_dmc.ruleData.archive.condition;
    var activateChecked = api.context.props.isActive;
    if (conditions && !activateChecked)
        return false;
    return true;
}
