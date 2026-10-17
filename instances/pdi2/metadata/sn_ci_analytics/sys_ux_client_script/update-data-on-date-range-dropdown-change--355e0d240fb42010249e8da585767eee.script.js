/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    const {
        encodeFilter,
        getBucketType,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();
    const {
        spokeName,
        startDate,
        endDate
    } = api.context.props;
    const CHAT = 'chat';
    const INTEGRATION_HUB = 'Integration Hub';
    const QUERY = 'query';
    const selectedSpoke = spokeName || api.state.selectedSpoke;
    if (selectedSpoke) {
        const bucketType = event.payload.item.id;
        const filter = {
            event_type: INTEGRATION_HUB,
            platform: CHAT,
            from_date: startDate,
            to_date: endDate,
            date_bucket: bucketType,
            event_name_filter: selectedSpoke
        };
        api.setState('parFilters', [{
            'order': 10,
            'type': 'query',
            'apply_to': [
                'sn_ci_analytics_st_property_summary_by_event',
                'sn_ci_analytics_st_event_occurrence'
            ],
            'encoded_query': encodeFilter(filter)
        }]);
        api.setState('dateRangeDropdownValue', [bucketType]);
        api.setState('csvUrlActivity', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodeFilter(filter)));
    }
}
