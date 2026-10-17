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
        page_route,
        mode,
        sys_id: searchConfigId,
        url
    } = api.data.fetch_search_config.output;
    const {
        fieldValue: searchTerm
    } = event.payload;
    switch (mode) {
        case 'current_page':
            helpers.navigate.to(page_route, {
                searchTerm,
                searchConfigId
            }, null);
            break;
        case 'new_page':
            api.emit('NAV_ITEM_SELECTED', {
                external: {
                    url: `${url}/${searchTerm}`
                }
            });
            break;
    }
}
