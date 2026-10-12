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
    let searchResults = api.state.searchResults;
    var data = api.data.ace_fetch_search_config.output;
    if (event.elementId == 'search_evam_data_resource') {
        searchResults = searchResults.concat(api.data.search_evam_data_resource.searchResultsTemplates.items);
        api.setState('searchResults', searchResults);
    }
    const {
        search_index
    } = api.state.searchConfigs;
    if (data.length == search_index)
        api.setState('finalSearchResults', {
            'items': searchResults
        });
    const config = {
        ...data[search_index]
    }
    api.setState('searchConfigs', {
        ...config,
        search_index: search_index + 1
    });
}
