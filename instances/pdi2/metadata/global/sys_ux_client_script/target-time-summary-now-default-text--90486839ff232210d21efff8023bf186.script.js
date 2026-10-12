/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {

    const ruleData = api.data.rule_management_dmc.ruleData;
    if(!ruleData || !ruleData.onetime_delete) return;

    const {
        run_at,
        schedule_type
    } = ruleData.onetime_delete;

    const execTimeMap = {
      execute_later: run_at,
      execute_upon_creation: helpers.translateSync("Execute upon creation."),
      schedule_later: helpers.translateSync("Not scheduled.")
    };

    return helpers.translateSync("Execute target time")+ ": " + execTimeMap[schedule_type];
}
