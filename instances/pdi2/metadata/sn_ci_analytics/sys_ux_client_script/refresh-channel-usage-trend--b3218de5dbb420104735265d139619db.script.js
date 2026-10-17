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
    const selectedItem = event.payload.item.id;
    api.setState('dateBucketChannelUsageTrend', [selectedItem]);

    const query = {
        from_date: api.context.props.startDate,
        to_date: api.context.props.endDate,
        platform: 'chat',
        event_type: 'Topic Category',
        event_name_filter: api.state.selectedCategory,
        date_bucket_topic_usage_trend: api.state.dateBucketTopicUsageTrend[0],
        date_bucket_channel_usage_trend: selectedItem,
        timestamp: Date.now()
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
    api.setState('csvUrlChannel', getCsvUrl('sn_ci_analytics_st_event_property_value_trend', encodeFilter(query), { property_name: 'Channel Name'}));
}
