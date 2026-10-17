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
        "label": helpers.translateSync("Article ID"),
        "value": {
            "type": "string",
            "value": api.context.props.kbNumber,
        }
    }];
}
