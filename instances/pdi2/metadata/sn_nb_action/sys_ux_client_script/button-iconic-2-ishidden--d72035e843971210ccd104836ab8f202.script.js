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
    if ((searchTermBeforeInitiateSearch && searchTermBeforeInitiateSearch.length > 0) ||
        (showClearSearchResult && searchTerm && searchTerm.length > 0)) {
        return false;
    }
    return true;
}
