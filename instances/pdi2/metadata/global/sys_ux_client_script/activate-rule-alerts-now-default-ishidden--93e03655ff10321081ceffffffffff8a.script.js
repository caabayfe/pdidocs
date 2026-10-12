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
    var activateChecked = api.data.rule_management_dmc.ruleData.archive.active;
    if (!(conditions && activateChecked))
        return false;
    return true;
}
