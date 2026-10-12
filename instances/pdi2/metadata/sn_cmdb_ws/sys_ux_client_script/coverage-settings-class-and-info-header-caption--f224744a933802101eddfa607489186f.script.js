/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const infoItems = api.item.value.table_excluded_info;
    return {
        "label": infoItems.join('. ')
    };
}
