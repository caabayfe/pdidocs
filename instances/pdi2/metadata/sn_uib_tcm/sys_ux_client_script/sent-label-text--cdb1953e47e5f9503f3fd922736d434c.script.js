/**
 * @param {params} params 
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var frequency = api.item.value.communication_frequency.value;
    if (frequency == "recurring") return helpers.translateSync("Last sent");
    else return helpers.translateSync("Sent");
}
