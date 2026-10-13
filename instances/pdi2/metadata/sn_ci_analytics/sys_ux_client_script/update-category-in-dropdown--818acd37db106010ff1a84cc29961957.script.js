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
    let selectedCategory = api.context.props.selectedCategory;
    if (!selectedCategory) {
        const output = api.data.fetch_categories.output;
        selectedCategory = output && output[0] || '';
    }

    if (selectedCategory) {
        const {
            calculateInitialDateRange
        } = imports["sn_ci_analytics.dateUtils"]();

        api.setState('selectedCategory', selectedCategory);

        const {
            startDate,
            endDate
        } = api.context.props;

        const {
            datePickerStartDate,
            datePickerEndDate,
            isoFormattedStartDate,
            isoFormattedEndDate
        } = calculateInitialDateRange(startDate, endDate);

        const {
            encodeFilter,
            getBucketType,
            getCsvUrl
        } = imports['sn_ci_analytics.VADasboardUtils']();
        const dateBucket = getBucketType(isoFormattedStartDate, isoFormattedEndDate);
        api.setState('dateBucketTopicUsageTrend', [dateBucket]);
        api.setState('dateBucketChannelUsageTrend', [dateBucket]);

        const query = {
            from_date: isoFormattedStartDate,
            to_date: isoFormattedEndDate,
            platform: 'chat',
            event_type: 'Topic Category',
            event_name_filter: selectedCategory,
            date_bucket_topic_usage_trend: dateBucket,
            date_bucket_channel_usage_trend: dateBucket,
            timestamp: Date.now()
        };
        api.setState('parFilters', [{
            "order": 10,
            "type": "query",
            "apply_to": api.state.tables,
            "encoded_query": encodeFilter(query)
        }]);
        api.setState('csvUrlTopicUsage', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodeFilter(query)));
        api.setState('csvUrlChannel', getCsvUrl('sn_ci_analytics_st_event_property_value_trend', encodeFilter(query), {
            property_name: 'Channel Name'
        }));
        api.setState("dateRangePickerInput", {
            startDate: datePickerStartDate,
            endDate: datePickerEndDate
        });

        helpers.navigate.setRouteParams({
            params: {
                startDate: isoFormattedStartDate,
                endDate: isoFormattedEndDate,
                selectedCategory: selectedCategory
            }
        });
    }
}
