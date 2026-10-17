/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var inActivePluginsCount = api.state.inActivePluginsCount;
    return inActivePluginsCount == 0;
}
