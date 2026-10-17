/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var index = api.item.index;
    var total = api.state.citationCount;
    // If not last item, return comma and space
    return index < total - 1 ? ', ' : '';
}
