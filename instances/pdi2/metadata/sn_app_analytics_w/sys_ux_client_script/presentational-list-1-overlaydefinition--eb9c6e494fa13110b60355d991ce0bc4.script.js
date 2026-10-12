/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.isDataVizLoading
        || api.state.isDataVizLoading === 'false')
        return {};

    return {
        type: 'loader'
    };
}
