/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const {
        currentPage,
        totalResults
    } = api.state;
    const searchResultsPerPage = api.context.props.searchResultsPerPage;
    const currentResultIndex = searchResultsPerPage + currentPage * searchResultsPerPage;

    let paginationText = helpers.translateSync("Showing {0}-{1} of {2}. ",
        1 + currentPage * searchResultsPerPage, 
        currentResultIndex > totalResults ? totalResults : currentResultIndex, 
        totalResults
      );
    let searchContext = helpers.translateSync("Select a result below");

    if (totalResults === 0) 
        return null;
    
    return totalResults <= searchResultsPerPage ? searchContext : paginationText.concat(searchContext);
}
