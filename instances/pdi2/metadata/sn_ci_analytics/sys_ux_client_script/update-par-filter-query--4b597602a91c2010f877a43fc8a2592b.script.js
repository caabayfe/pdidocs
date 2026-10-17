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
    const startDate = api.context.props.startDate;
    const endDate = api.context.props.endDate;
    if (!startDate || !endDate) return;
    const {
        getBucketType,
        encodeFilter,
        generatePARFilterQuery,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();

    const defaultDateRangeDropdownValue = getBucketType(startDate, endDate);
    const filter = {
        from_date: startDate,
        to_date: endDate,
        date_bucket: defaultDateRangeDropdownValue,
        timestamp: Date.now()
    };

    api.setState('dateRangeDropdownValue', [defaultDateRangeDropdownValue]);
    api.setState('parFilters', generatePARFilterQuery(encodeFilter(filter), [
        "sn_ci_analytics_st_conv_dynamic_property",
        "sn_ci_analytics_st_actionable_notifs",
        "sn_ci_analytics_st_session_count_per_locale",
        "sn_ci_analytics_st_session_duration"
    ]));
    api.setState('csvUrlDuration', getCsvUrl('sn_ci_analytics_st_session_duration', encodeFilter(filter)));
}
