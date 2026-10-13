/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    let message = "";
    if (api.item.value.conferenceCallNumber && api.item.value.conferenceCallNumber.displayValue)
        message = helpers.translateSync("Meeting options for {0}", api.item.value.conferenceCallNumber.displayValue);
    return {
        "trigger": {
            "aria-label": message
        }
    };
}
