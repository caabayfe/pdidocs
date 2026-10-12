/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var data = Array.isArray(api.item.value.highlightedText) ? api.item.value.highlightedText : [api.item.value.highlightedText];
    return data;
}
