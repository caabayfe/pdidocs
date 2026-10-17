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
    const bucketType = event.payload.item.id;
    const startDate = api.context.props.startDate;
    const endDate = api.context.props.endDate;
    const { encodeFilter, getCsvUrl } = imports['sn_ci_analytics.VADasboardUtils']();
    const filter = {
        from_date: startDate,
        to_date: endDate,
        date_bucket: bucketType
    };
    api.setState('dateRangeDropdownValue', [bucketType]);
    api.setState('parFilters', [{
        "order": 10,
        "type": "query",
        "apply_to": [
            "sn_ci_analytics_st_conv_dynamic_property",
            "sn_ci_analytics_st_actionable_notifs",
            "sn_ci_analytics_st_session_count_per_locale",
            "sn_ci_analytics_st_session_duration"
        ],
        "encoded_query": encodeFilter(filter)
    }]);
    api.setState('csvUrlDuration', getCsvUrl('sn_ci_analytics_st_session_duration', encodeFilter(filter)));
}
