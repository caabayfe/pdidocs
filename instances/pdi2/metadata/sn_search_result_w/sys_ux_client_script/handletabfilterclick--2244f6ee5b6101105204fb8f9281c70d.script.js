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
        globalSearchDataConfigId: props.globalSearchDataConfigId,
        searchTerm: props.searchTerm,
        searchFilters: event.payload.selectedFilter,
        sortFilters: props.sortFilters,
        disableSpellCheck: props.disableSpellCheck,
        backButtonLabel: props.backButtonLabel,
        searchContext: props.searchContext,
        routeConfigId: props.routeConfigId,
        workspaceSiteName: props.workspaceSiteName
    };

    // Persist facets across tabs if the property is set to true
    const {
        booleanValue: persistFacets
    } = api.data.facets_cross_tab_persistence.properties;
    if (persistFacets) {
        params.facetFilters = props.facetFilters;
    }

    helpers.navigate.to('search', {
        globalSearchViewConfigId: props.globalSearchViewConfigId
    }, params, false, false);
}
