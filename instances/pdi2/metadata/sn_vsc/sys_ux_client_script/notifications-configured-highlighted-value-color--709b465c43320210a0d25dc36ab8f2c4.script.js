/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var value = api?.data?.policy_details_form?.form?.fields?.configured?.value;
    if (value === "configured") {
        return "green";
    } else if (value === "not_configured") {
        return "critical";
    } else { // undefined, used only during load
        return "gray";
    }
}
