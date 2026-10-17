/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
        "label": api.item.value.friendly_name,
        "value": {
            "label": api.item.value.indicator_info,
            "showIcon": true,
            "status": api.item.color_code,
            "type": "highlighted-value"
        }
    }];
}
