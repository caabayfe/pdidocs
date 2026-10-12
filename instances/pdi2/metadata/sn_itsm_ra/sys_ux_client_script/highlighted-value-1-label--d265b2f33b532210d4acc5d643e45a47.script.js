/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.customExpProps && api.context.props.customExpProps.recommendationHint)
        return helpers.translateSync(api.context.props.customExpProps.recommendationHint);
}
