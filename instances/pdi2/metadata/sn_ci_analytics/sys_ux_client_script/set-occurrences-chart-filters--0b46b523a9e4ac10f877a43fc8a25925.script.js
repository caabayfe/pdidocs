/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const {
        startDate,
        endDate,
        platform
    } = api.context.props;
    const {
        encodeFilter,
        getBucketType,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();

    const occurrenceView = getBucketType(startDate, endDate);
    api.setState('occurrenceView', [occurrenceView]);
    
    let customEventName = api.state.selectedEvent;
    if (!customEventName) {
        customEventName = api.data.fetch_custom_events.output ? api.data.fetch_custom_events.output[0] : null;
        api.setState('selectedEvent', customEventName);
    }
    
    const filter = {
        from_date : startDate,
        to_date : endDate,
        platform: platform || 'chat',
        event_name_filter: customEventName,
        date_bucket: occurrenceView || 'day',
        timestamp: Date.now()
    };
    api.setState('occurrencesFilterObj', filter);
    
    const parFilters = [{
        'order': 1,
        'type': 'query',
        'apply_to': ['sn_ci_analytics_st_event_occurrence'],
        'encoded_query': encodeFilter(filter)
    }];

    api.setState('parFilters', parFilters);
    api.setState('csvUrlOccurrences', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodeFilter(filter)));

    // Clear the event properties "repeater" component data if present
    api.setState('eventProperties', []);
}
