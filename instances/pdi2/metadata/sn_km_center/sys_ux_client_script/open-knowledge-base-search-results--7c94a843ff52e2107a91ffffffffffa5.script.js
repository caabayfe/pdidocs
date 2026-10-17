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
    var isAISearchEnabled = api.data.check_ai_search_satus_1.output;
    if (isAISearchEnabled) {
        const selectedKB = event.context.item ? event.context.item.value.title : "";
        
        const fields = {
            searchContextConfigId: api.state.searchConfigId
        };

        const params = {
            searchTerm: "***",
            facetFilters: selectedKB ? JSON.stringify([`_kb_knowledge.kb_knowledge_base_s:FACET("${selectedKB}")`]) : ""
        };

        helpers.navigate.to('search-results', fields, params, false, false);

    } else {
        const kbParam = event.context.item ? `&kb_knowledge_base=${event.context.item.value.sys_id}` : "";
        api.emit('NAV_ITEM_SELECTED', {
            context: {
                path: 'now/nav/ui'
            },
            route: 'classic',
            fields: null,
            params: {
                target: '/kb?id=search&spa=1&from_knowledge_center=true' + kbParam
            }
        });
    }
}
