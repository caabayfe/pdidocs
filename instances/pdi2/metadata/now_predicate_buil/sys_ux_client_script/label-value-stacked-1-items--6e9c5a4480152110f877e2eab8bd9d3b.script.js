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
            "label": "Recommended Configuration",
            "value": {
                "type": "string",
                "value": api.context.props.recommendedConfiguration
            }
        },
        {
            "label": "Current Configuration",
            "value": {
                "type": "string",
                "value": api.context.props.currentConfiguration
            }
        }
    ];
}
