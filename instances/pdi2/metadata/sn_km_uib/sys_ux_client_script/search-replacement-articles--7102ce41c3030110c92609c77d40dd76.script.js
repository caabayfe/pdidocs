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
    let keyword = event.payload.value + '';

    if (keyword.length > 3) {
        let items = api.state.replacementArticlesList;

        if (items.length == 0 || (items.findIndex(item => item.label === keyword) == -1)) {
            api.setState('searchKeyword', keyword);

            var updateReferenceFieldItems = {
                operation: {
                    dataElementId: 'search_knowledge_records',
                    operationName: 'REFRESH'
                }
            };

            api.emit('UXF_DB_OP_TRIGGER_REQUESTED', updateReferenceFieldItems);
        }
    }
}
