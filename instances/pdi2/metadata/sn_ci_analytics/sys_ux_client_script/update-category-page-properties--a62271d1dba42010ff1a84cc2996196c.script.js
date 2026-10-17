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
    const payload = event.payload;
    const item = payload.item;
    if (item) {
        const categoryId = item.id || '';
        helpers.navigate.to('category', null, {
            startDate: api.context.props.startDate,
            endDate: api.context.props.endDate,
            selectedCategory: categoryId
        });
    } else {
        const {
            getDateRangeFromISOString
        } = imports["sn_ci_analytics.dateUtils"]();
        const {
            isoStart,
            isoEnd
        } = payload;
        const {startDate, endDate} = getDateRangeFromISOString(isoStart, isoEnd);
        const selectedCategory = api.context.props.selectedCategory;
        const query = {
            from_date: startDate,
            to_date: endDate,
            platform: 'chat',
            event_type: 'Topic Category',
            event_name_filter: selectedCategory,
            date_bucket_topic_usage_trend: api.state.dateBucketTopicUsageTrend[0],
            date_bucket_channel_usage_trend: api.state.dateBucketChannelUsageTrend[0]
        };
        const {
            encodeFilter,
            getCsvUrl
        } = imports['sn_ci_analytics.VADasboardUtils']();
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
        helpers.navigate.setRouteParams({
            params: {
                startDate: startDate,
                endDate: endDate,
                selectedCategory: selectedCategory
            }
        });
    }
}
