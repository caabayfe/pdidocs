/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var result = api.data.look_up_records_1.results[0];
    return result.cat_item.displayValue == null;
}
