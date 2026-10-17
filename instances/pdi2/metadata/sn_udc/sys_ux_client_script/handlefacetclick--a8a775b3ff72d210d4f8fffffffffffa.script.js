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
        searchContext: props.searchContext,
        sortFilters: props.sortFilters,
        facetFilters: event.payload.selectedFilters,
        disableSpellCheck: props.disableSpellCheck,
        backButtonLabel: props.backButtonLabel
    }, false, false);
}
