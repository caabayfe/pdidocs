/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.groupName) {
        return helpers.translateSync('CI overview: {0}', api.context.props.groupName)
    }
    return helpers.translateSync('CI overview');
}
