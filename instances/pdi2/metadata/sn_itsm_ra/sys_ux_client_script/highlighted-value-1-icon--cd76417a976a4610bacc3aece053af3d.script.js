/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.customExpProps && api.context.props.customExpProps.useCase == "search") {
        return "Magnifying Glass Outline";
    } else {
        return "Lightbulb Outline";
    }
}
