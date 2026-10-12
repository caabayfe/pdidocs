/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    api.setState('managedSearchInput', '');
    api.setState('results', []);
    api.setState('hasNextPage', false);
    api.setState('query', null);
    api.setState('advancedSearchQuery', null);
    api.setState('offset', 0);
    api.setState('currentPage', 0);
    api.setState('totalResults', -1);
}
