/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.loadingSkippedTable
        || api.state.loadingSkippedTable === 'false')
        return {};

    return {
        type: 'loader'
    };
}
