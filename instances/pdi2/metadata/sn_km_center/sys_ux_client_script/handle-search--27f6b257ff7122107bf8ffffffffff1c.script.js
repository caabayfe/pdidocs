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
    const fields = {
        searchContextConfigId: api.context.props.searchContextConfigId
    };
    const params = {
        searchTerm: event.payload.searchTerm,
        searchFilters: api.context.props.searchFilters
    };
    if (event.name === 'SN_SEARCH_RESULTS_CONTAINER#SEARCH_EXECUTED') {
        params.disableSpellCheck = true;
    } else if (event.name === 'SN_SEARCH_COMBOBOX#SEARCH_EXECUTED') {
        params.disableSpellCheck = false;
    }
    if (event.payload.searchTerm !== "") {
        helpers.navigate.to('search-results', fields, params, false, false);
    }
}
