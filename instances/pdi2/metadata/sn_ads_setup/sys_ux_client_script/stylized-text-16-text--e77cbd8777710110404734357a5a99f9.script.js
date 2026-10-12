/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.context.props.id == -1)
        return helpers.translateSync("Creating your Category & task board...");
    else
        return helpers.translateSync("Loading your Category & task board...");
}
