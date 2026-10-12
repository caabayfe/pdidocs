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
    if (api.data.search_knowledge_records.results) {
        var items = api.data.search_knowledge_records.results.map(function(item) {
            return {
                id: item._row_data.uniqueValue,
                label: item._row_data.displayValue.trim() + ' - ' + item.short_description.value.trim()
            };
        });

        api.setState('replacementArticlesList', items);
    }
}
