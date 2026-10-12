/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const ageFieldAlert = api.data.rule_management_dmc.ageFieldAlert;
    if (ageFieldAlert && ageFieldAlert.type == "info") {
        return {
            "label": "Close",
            "type": "dismiss"
        };
    } else {
        return {};
    }
}
