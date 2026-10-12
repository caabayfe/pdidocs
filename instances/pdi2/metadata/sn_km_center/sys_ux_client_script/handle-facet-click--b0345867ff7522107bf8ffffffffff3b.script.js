/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const props = api.context.props;
    const fields = {
        searchContextConfigId: props.searchContextConfigId
    };
    const params = {
        searchTerm: props.searchTerm,
        searchFilters: props.searchFilters,
        sortFilters: props.sortFilters,
        facetFilters: event.payload.selectedFilters,
        disableSpellCheck: props.disableSpellCheck
    };
    helpers.navigate.to('search-results', fields, params, false, false);
}
