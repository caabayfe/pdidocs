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
    const props = api.context.props;
    helpers.navigate.to('unified-developer-search-page', {
        version: 'v2',
        globalSearchViewConfigId: props.globalSearchViewConfigId
    }, {
        aisSearchContextId: props.aisSearchContextId,
        zingSearchContextId: props.zingSearchContextId,
        searchTerm: props.searchTerm,
        searchFilters: props.searchFilters,
        sortFilters: props.sortFilters,
        searchContext: props.searchContext,
        facetFilters: props.facetFilters,
        disableSpellCheck: props.disableSpellCheck,
        backButtonLabel: props.backButtonLabel,
        paginationToken: event.payload.paginationToken
    }, false, false);
}
