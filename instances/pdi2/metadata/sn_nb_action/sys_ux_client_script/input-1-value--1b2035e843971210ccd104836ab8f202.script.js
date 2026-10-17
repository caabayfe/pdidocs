/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const searchTerm = api.state.searchTerm;
    const searchTermBeforeInitiateSearch = api.state.searchTermBeforeInitiateSearch;
    const showClearSearchResult = api.state.showClearSearchResult;
    return showClearSearchResult ? searchTerm : searchTermBeforeInitiateSearch;
}
