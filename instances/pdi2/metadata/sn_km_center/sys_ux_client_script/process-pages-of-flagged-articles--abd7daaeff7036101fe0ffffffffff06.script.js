/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        sysIds,
        rowEnd,
        moreRemaining,
        rowCount
    } = api.data.get_page_of_flagged_articles_1.output;

    if (moreRemaining && rowCount < 1000) {
        // If its a reasonable number of articles, immediately get all
        // of the rest of the articles
        api.setState("rowLimit", 10000);
        return;
    }

    // Either replace the sysids or concatenate them together.
    let currentPageOfArticles = api.state.currentPageOfArticles;
    currentPageOfArticles = currentPageOfArticles === 'LOADING' ?
        `${currentPageOfArticles},${sysIds}` : sysIds;

    api.setState("currentPageOfArticles", sysIds);
    api.setState("rowEnd", rowEnd);
    api.setState("moreRemaining", moreRemaining);
    api.setState("articleCount", rowCount);

}
