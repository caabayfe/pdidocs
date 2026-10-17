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
    const searchResults = api.data?.look_up_records?.results;
    const advancedSearchResults = api.data?.lookup_advanced_search?.output;

    const { offset, managedSearchInput, totalResults } = api.state;
    const { enableAdvancedSearch } = api.context.props;

    // Advanced search results get priority
    const resultsToProcess = enableAdvancedSearch ? advancedSearchResults : searchResults;

    if (!resultsToProcess
        || !Array.isArray(resultsToProcess)
        || managedSearchInput == '') {
        return;
    }

    let EMPTY_STATE_CONTENT_TRANSLATED = await helpers.translate('Try again with a different search term.');    
    api.setState('emptyStateContent', EMPTY_STATE_CONTENT_TRANSLATED);

    const fields = api.context.props.fields ? api.context.props.fields.split(',') : [];
    const { showEmptyValues } = api.context.props;
    const EMPTY_FIELD_VALUE = await helpers.translate('No data');
    const { parseLookupData } = imports['sn_record_lookup.lookupDataParser']();
    const results = await Promise.all(resultsToProcess.map(async (row) => {
        const labelValueItems = parseLookupData(row, fields, showEmptyValues, EMPTY_FIELD_VALUE);
        const LINK_TRANSLATED = await helpers.translate('Link to {0}', row?._row_data?.displayValue);
 
        return {
            headingName: row?._row_data?.displayValue,
            sysId: row?._row_data?.uniqueValue,
            items: labelValueItems,
            actions: [{
                'icon': 'link-outline',
                'label': LINK_TRANSLATED,
                'data': {
                    sysId: row?._row_data?.uniqueValue,
                    displayValue: row?._row_data?.displayValue,
                    items: labelValueItems
                }
            }]
        };
    }).filter(e => !!e));

    const searchResultsPerPage = api.context.props.searchResultsPerPage;
    if (totalResults === -1) {
        if (results.length === 0) {
            api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{
                message: await helpers.translate('No results for "{0}"', managedSearchInput), 
                type:'polite'
            });
        } else if (results.length === 1) {
            api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{
                message: await helpers.translate('{0} result for "{1}"', results.length, managedSearchInput), 
                type:'polite'
            });
        } else {
            api.emit('SEISMIC_ARIA_LIVE_REGION_UPDATE_REQUESTED',{
                message: await helpers.translate('{0} results for "{1}"', results.length, managedSearchInput), 
                type:'polite'
            });
        }
    }
    if (offset === 0) {
        api.setState("totalResults", results.length);
    }
    api.setState('hasNextPage', results.length > searchResultsPerPage ? true : false);
    api.setState('results', results.length > searchResultsPerPage ? results.slice(0, searchResultsPerPage) : results);
}
