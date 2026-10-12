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
    const params = {
        aisSearchContextId: props.aisSearchContextId,
        zingSearchContextId: props.zingSearchContextId,
        searchTerm: props.searchTerm,
        searchFilters: event.payload.selectedFilter,
        sortFilters: props.sortFilters,
        disableSpellCheck: props.disableSpellCheck,
        backButtonLabel: props.backButtonLabel,
        searchContext: props.searchContext
    };

    //Persist facets across tabs if the property is set to true
    const persistFacets = api.data.udc_facets_cross_tab_persistence.output.properties['glide.ais.facets.cross_tab_persistence'];
    
    if (persistFacets) {
        params.facetFilters = props.facetFilters;
    }

    helpers.navigate.to('unified-developer-search-page', {
        version: 'v2',
        globalSearchViewConfigId: props.globalSearchViewConfigId
    }, params, false, false);
}
