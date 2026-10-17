/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var conditions = api.data.rule_management_dmc.ruleData.archive.condition;
    if (!conditions)
        return helpers.translateSync("A condition must be specified for a rule to be active");
    var activateChecked = api.data.rule_management_dmc.ruleData.archive.active;
    if (!activateChecked)
        return helpers.translateSync("Rule is inactive. It is recommended to recalculate archive estimate before setting rule to active.");
}
