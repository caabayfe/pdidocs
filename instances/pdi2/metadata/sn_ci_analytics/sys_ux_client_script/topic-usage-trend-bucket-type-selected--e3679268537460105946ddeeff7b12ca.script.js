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
    const topicName = api.context.props.topicName;
    const startDate = api.context.props.startDate;
    const endDate = api.context.props.endDate;
    const {
        encodeFilter,
        getBucketType,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();
    const bucketType = event.payload.item.id || getBucketType(startDate, endDate);

    function getFilter(startDate, endDate, bucketType) {
        const filter = {
            from_date: startDate,
            to_date: endDate,
            platform: "chat",
            date_bucket: bucketType,
            event_name_filter: topicName,
            event_type: "Topic"
        };
        return filter;
    }
    
    const encodedFilter = encodeFilter(getFilter(startDate, endDate, bucketType));
    api.setState('bucketType', [bucketType]);
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
}
