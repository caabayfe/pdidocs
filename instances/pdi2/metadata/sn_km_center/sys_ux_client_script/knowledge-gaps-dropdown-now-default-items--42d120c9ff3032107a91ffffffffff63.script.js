/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return (api.state.gapTaskTypeData || [])
        .filter(item => item.canRead && item.isGenAIPluginActive)
        .map(({
            id,
            label
        }) => ({
            id,
            label
        }));
}
