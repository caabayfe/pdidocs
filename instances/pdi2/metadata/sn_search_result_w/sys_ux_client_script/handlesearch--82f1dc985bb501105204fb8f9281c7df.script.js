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
			globalSearchDataConfigId: props.globalSearchDataConfigId,
			sortFilters: props.sortFilters,
            searchContext: props.searchContext,
			facetFilters: props.facetFilters,
			backButtonLabel: props.backButtonLabel,
			routeConfigId: props.routeConfigId,
			workspaceSiteName: props.workspaceSiteName,
        };
	if (event.name === 'SN_SEARCH_RESULT_WRAPPER#SEARCH_EXECUTED') {
            params.searchTerm = event.payload.searchTerm;
            params.disableSpellCheck = true;
        } else if (event.name === 'SN_SEARCH_INPUT_WRAPPER#SEARCH_EXECUTED') {
            params.searchTerm = event.payload.searchTerm;
            params.disableSpellCheck = false;
        }
    	helpers.navigate.to('search', {
			globalSearchViewConfigId: props.globalSearchViewConfigId
    	}, params, false, false);
}
