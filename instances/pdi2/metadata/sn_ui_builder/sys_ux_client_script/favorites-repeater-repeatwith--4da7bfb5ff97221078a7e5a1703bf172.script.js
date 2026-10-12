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
    const allCards = api.context.props.favorites;
    const pageStart = currentPage * 15;
    let pageEndLength = (currentPage * 15) + 15;
    if (pageEndLength > allCards.length) {
        pageEndLength = allCards.length;
    }
    return allCards.slice(pageStart, pageEndLength);
}
