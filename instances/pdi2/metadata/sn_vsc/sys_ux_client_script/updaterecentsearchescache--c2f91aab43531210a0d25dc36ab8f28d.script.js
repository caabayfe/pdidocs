/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    // Once the api to get filtered list for a given user string is completed successfully, update the searche cache
    const searchResults = api?.data.get_next_set_of_typeahead_list_items?.output?.items;
    const currentElementId = api?.data.get_next_set_of_typeahead_list_items?.output?.currentElementId;
    const typeAheadRecentSearchesCache = api?.state?.typeAheadRecentSearchesCache;
    let elementResultsToUpdate = {
        ...typeAheadRecentSearchesCache,
        [currentElementId] : searchResults
    };
    api.setState("typeAheadRecentSearchesCache", elementResultsToUpdate);
}
