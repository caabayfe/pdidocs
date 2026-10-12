/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.data.get_watchlist_user_items.execute({
        table: 'sys_user',
        searchTerm: api.state.watchlistSearchTerm,
    });
}
