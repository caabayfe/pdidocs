/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var state = api.item.value.cells.state.value;
    if (state == "Completed") {
        return api.item.value.cells.duration.label;
    } else {
        return api.item.value.cells.estimated_end_time.value;
        //return "hello";
    }
}
