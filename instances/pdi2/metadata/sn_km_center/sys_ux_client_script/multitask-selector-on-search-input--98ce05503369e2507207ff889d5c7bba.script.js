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
    if (event.name === 'NOW_INPUT#INPUT') {
        var searchInput = event.payload.fieldValue;
        api.setState('searchTerms', searchInput);
    } else if (event.name === 'NOW_DROPDOWN#ITEM_CLICKED') {
        var filter = event.payload.item.id;
        api.setState('searchFilters', filter);
        if (api.state.searchTerms != null && api.state.searchTerms.trim().length > 0)
            api.setState('isSearchLoading', true);
    } else if (event.name === 'NOW_BUTTON#CLICKED') {
        var searchInput = api.state.searchTerms;
        if (searchInput.trim().length > 0) {
            if (api.state.searchFilters != null && api.state.searchFilters.trim().length > 0)
                api.setState('isSearchLoading', true);
        } else {
            api.setState('searchResult', {
                rows: []
            });
        }
    }
}
