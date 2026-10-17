/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const tabs = [{
        id: "rule-activities",
        label: helpers.translateSync("Rule activities"),
        order: "10",
        route: "rule-activities"
    }];

    const appContext = api.data.dmc_rule_app_context.output;
    if( appContext && appContext.ruleManagementEnabled) {
        tabs.push({
            id: "rule-details",
            label: helpers.translateSync("Rule details"),
            order: "50",
            route: "rule-details"
        });
    }
    return tabs;
}
