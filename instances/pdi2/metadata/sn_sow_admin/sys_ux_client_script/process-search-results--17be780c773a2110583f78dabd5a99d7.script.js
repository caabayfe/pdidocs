/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
 async function handler({
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
    if (data.length == search_index) {
        const suffix = await helpers.translate('Info: This search result is a content block that has matched the search term. Clicking on it will navigate to the page containing the matched content block. In some instances the navigated page might not have the required content block due to visibility rules or the user permission issues or requirement of a plugin.');
        searchResults.forEach((result) => {
            result.propValues.title = '<div style="width:calc(100vw - 100px)">'+result.propValues.title+'</div>';
            result.propValues.summary = '<div style="width:calc(100vw - 100px)">'+result.propValues.summary+'</div><p style="visibility:hidden;overflow:hidden;text-overflow:clip"> '+suffix+'  </p></div>';
        });
        api.setState('finalSearchResults', {
            'items': searchResults
        });
    }
    const config = {
        ...data[search_index]
    };
    api.setState('searchConfigs', {
        ...config,
        search_index: search_index + 1
    });
}
