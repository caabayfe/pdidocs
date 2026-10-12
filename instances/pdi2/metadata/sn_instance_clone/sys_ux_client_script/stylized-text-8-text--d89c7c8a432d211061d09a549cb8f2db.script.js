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
        return api.state.translations.duration;
    } else {
        return api.state.translations.estimated_end_time;
    }
}
