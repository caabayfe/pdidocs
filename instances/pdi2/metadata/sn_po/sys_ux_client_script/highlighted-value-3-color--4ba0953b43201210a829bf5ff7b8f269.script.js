/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const colorMap = {
        "controlFlow": 'purple',
        "resourceGroup": 'teal',
        "other": "low"
    };
    return colorMap[api.item.value.type];
}
