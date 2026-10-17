/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        "label": api.item.value.table_label,
        "size": "sm",
        "variant": "tertiary"
    };
}
