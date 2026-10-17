/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    
    const {
        encodeFilter,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();
    
    const newBucket = event.payload.value[0];
    api.setState('occurrenceView', [newBucket]);
    
    const occurrencesFilter = api.state.occurrencesFilterObj || {};
    occurrencesFilter.date_bucket = newBucket;
    api.setState('occurrencesFilterObj', occurrencesFilter);
    api.setState('csvUrlOccurrences', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodeFilter(occurrencesFilter)));

    api.setState('parFilters', ({ currentValue }) => {
        return [{
            ...currentValue[0],
            encoded_query: encodeFilter(occurrencesFilter)
        }];
    });

}
