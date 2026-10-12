/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const props = api.context.props;
    const params = {
        searchFilters: props.searchFilters,
        zingSearchContextId: props.zingSearchContextId,
        sortFilters: props.sortFilters,
        searchContext: props.searchContext,
        facetFilters: props.facetFilters,
        backButtonLabel: props.backButtonLabel,
        searchTerm : event.payload.searchTerm,
        disableSpellCheck :true,
    };
    helpers.navigate.to('unified-developer-search-page', {
        version: 'v1',
        globalSearchViewConfigId: props.globalSearchViewConfigId
    }, params, false, false);
}
