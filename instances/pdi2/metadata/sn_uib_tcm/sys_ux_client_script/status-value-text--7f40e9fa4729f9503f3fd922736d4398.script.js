/**
 * @param {params} params 
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var state = api.item.value.state;
    var commCount = api.item.value.comm_count.value;
    var frequency = api.item.value.communication_frequency.value;
    if (state.value == "7") return state.display_value; // Skipped state
    else if (commCount > 0) {
        if (frequency == "recurring") return helpers.translateSync("Sent ({0}x)", commCount);
        else return helpers.translateSync("Sent");
    } else return helpers.translateSync("Not sent");
}
