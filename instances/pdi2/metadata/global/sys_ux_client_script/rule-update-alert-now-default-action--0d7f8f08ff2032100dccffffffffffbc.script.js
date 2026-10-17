/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const ruleUpdateAlert = api.data.rule_management_dmc.ruleUpdateAlert;
    if (ruleUpdateAlert && (ruleUpdateAlert.type == "info" || ruleUpdateAlert.type == "positive")) {
        return {
            "label": "Close",
            "type": "dismiss"
        };
    } else {
        return {};
    }
}
