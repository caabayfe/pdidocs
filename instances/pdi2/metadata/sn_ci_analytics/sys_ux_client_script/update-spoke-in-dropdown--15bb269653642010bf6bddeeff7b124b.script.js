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
        context,
        data,
        setState
    } = api;
    const {
        encodeFilter,
        getBucketType,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();
    const {
        calculateInitialDateRange
    } = imports["sn_ci_analytics.dateUtils"]();
    const CHAT = 'chat';
    const INTEGRATION_HUB = 'Integration Hub';
    const QUERY = 'query';
    const {
        startDate,
        endDate
    } = context.props;
    let {
        spokeName
    } = context.props;
    if (!spokeName) {
        const output = data.fetch_spokes.output;
        spokeName = output && output[0] || '';
    }

    if (spokeName) {
        const {
            datePickerStartDate,
            datePickerEndDate,
            isoFormattedStartDate,
            isoFormattedEndDate
        } = calculateInitialDateRange(startDate, endDate);
        const dateRangeValue = getBucketType(isoFormattedStartDate, isoFormattedEndDate);
        const query = {
            from_date: isoFormattedStartDate,
            to_date: isoFormattedEndDate,
            event_type: INTEGRATION_HUB,
            platform: CHAT,
            date_bucket: dateRangeValue,
            event_name_filter: spokeName,
            timestamp: Date.now()
        };
        setState('selectedSpoke', spokeName);
        setState('dateRangeDropdownValue', [dateRangeValue]);
        setState('parFilters', [{
            'order': 10,
            'type': QUERY,
            'apply_to': [
                'sn_ci_analytics_st_property_summary_by_event',
                'sn_ci_analytics_st_event_occurrence'
            ],
            'encoded_query': encodeFilter(query)
        }]);
        setState('csvUrlActivity', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodeFilter(query)));
        setState('datePickerInput', {
            startDate: datePickerStartDate,
            endDate: datePickerEndDate
        });
        helpers.navigate.setRouteParams({
            params: {
                startDate: isoFormattedStartDate,
                endDate: isoFormattedEndDate,
                spokeName: spokeName
            }
        });
    }
}
