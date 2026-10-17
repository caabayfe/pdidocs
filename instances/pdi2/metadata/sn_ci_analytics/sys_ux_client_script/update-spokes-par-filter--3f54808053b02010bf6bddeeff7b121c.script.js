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
        getDateRangeFromISOString
    } = imports["sn_ci_analytics.dateUtils"]();
    const {
        isoStart,
        isoEnd,
        item
    } = event.payload;
    const spoke = (item && item['id']) || '';
    let start, end;
    const dateRange = getDateRangeFromISOString(isoStart, isoEnd);
    if (dateRange) {
        start = dateRange.startDate;
        end = dateRange.endDate;
    }
    const startDate = start || api.context.props.startDate;
    const endDate = end || api.context.props.endDate;
    const spokeName = spoke || api.state.selectedSpoke;
    const CHAT = 'chat';
    const INTEGRATION_HUB = 'Integration Hub';
    const QUERY = 'query';
    helpers.navigate.setRouteParams({
        params: {
            startDate: startDate,
            endDate: endDate,
            spokeName: spokeName
        }
    });
    const {
        encodeFilter,
        getBucketType,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();
    const defaultDateRangeDropdownValue = getBucketType(startDate, endDate);
    const query = {
        from_date: startDate,
        to_date: endDate,
        event_type: INTEGRATION_HUB,
        platform: CHAT,
        date_bucket: defaultDateRangeDropdownValue,
        event_name_filter: spokeName,
        timestamp: Date.now()
    };
    api.setState('selectedSpoke', spokeName);
    api.setState('dateRangeDropdownValue', [defaultDateRangeDropdownValue]);
    api.setState('parFilters', [{
        'order': 10,
        'type': QUERY,
        'apply_to': [
            'sn_ci_analytics_st_property_summary_by_event',
            'sn_ci_analytics_st_event_occurrence'
        ],
        'encoded_query': encodeFilter(query)
    }]);
    api.setState('csvUrlActivity', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodeFilter(query)));
}
