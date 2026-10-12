/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.item.value.cells.state.value == "Running" || api.item.value.cells.state.value == "Rolling back") {
        return false;
    } else {
        return true;
    }

}
