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
    helpers.navigate.to('search', {
        globalSearchViewConfigId: props.globalSearchViewConfigId
    }, {
        globalSearchDataConfigId: props.globalSearchDataConfigId,
        searchTerm: props.searchTerm,
        searchFilters: event.payload.sourceFilters,
        searchContext: props.searchContext,
        sortFilters: props.sortFilters,
        facetFilters: event.payload.selectedFilters,
        disableSpellCheck: props.disableSpellCheck,
        backButtonLabel: props.backButtonLabel,
        routeConfigId: props.routeConfigId,
        workspaceSiteName: props.workspaceSiteName
    }, false, false);
}
