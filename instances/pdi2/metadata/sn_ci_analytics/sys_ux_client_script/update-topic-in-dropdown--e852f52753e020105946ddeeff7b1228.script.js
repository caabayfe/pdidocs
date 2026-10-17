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
    let { topicName, startDate, endDate } = api.context.props;
    if (event.payload.item && event.payload.item.id) {
        topicName = event.payload.item.id;
    }

    if (!topicName) {
        let topics = api.data.fetch_topics.output;
        topicName = topics && topics[0] || '';
    }
    const {
        encodeFilter,
        getBucketType,
        getCsvUrl
    } = imports["sn_ci_analytics.VADasboardUtils"]();
    const bucketType = getBucketType(startDate, endDate);
    const filter = {
        from_date: startDate,
        to_date: endDate,
        platform: "chat",
        date_bucket: bucketType,
        event_name_filter: topicName,
        event_type: "Topic"
    };
    const encodedFilter = encodeFilter(filter);
    api.setState('parFilters', [{
        "order": 10,
        "type": "query",
        "apply_to": [
            "sn_ci_analytics_st_property_summary_by_event"
        ],
        "encoded_query": encodedFilter
    }, {
        "order": 11,
        "type": "query",
        "apply_to": [
            "sn_ci_analytics_st_event_occurrence"
        ],
        "encoded_query": encodedFilter
    }]);
    api.setState('csvUrlTopicUsage', getCsvUrl('sn_ci_analytics_st_event_occurrence', encodedFilter));
    const params = {
        startDate,
        endDate,
        topicName
    };
    api.setState("selectedTopic", topicName);
    helpers.navigate.setRouteParams({
        params
    });
}
