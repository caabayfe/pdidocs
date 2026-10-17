/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (!api.state.loadingSkippedRecordsTable
        || api.state.loadingSkippedRecordsTable === 'false')
        return {};

    return {
        type: 'loader'
    };
}
