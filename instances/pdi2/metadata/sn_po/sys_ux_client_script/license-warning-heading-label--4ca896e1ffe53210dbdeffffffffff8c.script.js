/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return helpers.translateSync('Mine more than {0} records?', api.state.meteredUsageLimit.formatted);
}
