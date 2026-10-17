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
        "button": {
            "role": "tab",
            "aria-label": api.context.props.item.title
        }
    };
}
