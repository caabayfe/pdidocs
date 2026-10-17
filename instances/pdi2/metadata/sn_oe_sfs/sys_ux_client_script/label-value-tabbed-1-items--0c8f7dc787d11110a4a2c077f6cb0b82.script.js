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
        "label": api.state.payload.subtitle,
        "value": {
            "type": "highlighted-value",
            "label": api.state.payload.badgeText,
            "status": "info",
            "variant": "primary"
        }
    }];
}
