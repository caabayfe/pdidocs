/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const currentPage = api.state.currentPage;
    const allCards = api.data.controller.searchTerm ?
        api.data.controller.filteredRecordsByClass.pageCollection :
        api.data.controller.allRecordsByClass.pageCollection;
    const pageStart = currentPage * api.state.cardsPerPage;
    let pageEndLength = (currentPage * api.state.cardsPerPage) + api.state.cardsPerPage
    if (pageEndLength > allCards.length) {
        pageEndLength = allCards.length;
    }
    return allCards.slice(pageStart, pageEndLength);
}
