/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var appName = api.context.props.payload.name;
    return {
        "button": {
            "aria-label": `${appName} application`,
            "role": "link"
        }
    };
}
