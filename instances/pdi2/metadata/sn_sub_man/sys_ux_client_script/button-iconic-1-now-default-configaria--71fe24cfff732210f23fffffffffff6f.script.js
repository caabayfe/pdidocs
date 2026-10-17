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
            "aria-label": api.context.props.templateInput.totalUsedCardTooltip
        }
    };
}
