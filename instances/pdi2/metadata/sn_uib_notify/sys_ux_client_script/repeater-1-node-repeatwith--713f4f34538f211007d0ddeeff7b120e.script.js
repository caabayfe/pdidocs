/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    if (api.state.isSearchingAndFiltering) {
        return api.state.searchAndFilterResults;
    } else {
        return api.state.conferenceCalls;
    }
}
