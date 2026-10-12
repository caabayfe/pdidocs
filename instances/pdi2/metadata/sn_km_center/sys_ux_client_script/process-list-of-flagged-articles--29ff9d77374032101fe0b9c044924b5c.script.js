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
    const {output} = api.data.get_flagged_knowledge_articles;
    const {kbEncodedQuery} = api.context.props;
    const kbQuery = kbEncodedQuery || "";
    if (!output || !output?.length) {
        return;
    }
    // Make sure we're working with a new array, not mutating state
    const queryData = [...output];

    const flaggedArticles = queryData.map(flaggedArticle => {
        return {
            rowKey: flaggedArticle.sys_id,
            cellValue: {
                key: 'detectedissues',
                value: Object.values(flaggedArticle.results).map(result => {
                    return {label: `${result.name} - ${result.count}`}
                })
            }
        };
    });
    
    api.setState('flaggedArticles', (flaggedArticles));
    api.setState('loadingAllArticles', false);
    api.setState('flaggedArticlesEncodedQuery', kbQuery);
    
}
