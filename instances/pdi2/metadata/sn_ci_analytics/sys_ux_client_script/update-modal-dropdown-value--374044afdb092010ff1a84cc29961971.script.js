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
    var startDate = api.context.props.startDate;
    var endDate = api.context.props.endDate;
    if (!startDate || !endDate) return;
    const {
        getBucketType,
        encodeFilter,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();

    var dropdownValue = (event.payload && event.payload.item && event.payload.item.id) ? event.payload.item.id : getBucketType(startDate, endDate);
    var filter = {
        from_date: startDate,
        to_date: endDate,
        date_bucket: dropdownValue,
    };
    api.setState('modalDropdownValue', [dropdownValue]);
    var parFiltersArray = [{
        "order": 10,
        "type": "query",
        "apply_to": api.state.tables,
        "encoded_query": encodeFilter(filter)
    }];
    var dateQuery = `sys_created_onBETWEENjavascript:gs.dateGenerate('${filter.from_date}','00:00:00')@javascript:gs.dateGenerate('${filter.to_date}','23:59:59')`;
    var ssaId = api.state.selectedSsaId;
    var metricQuery = "deflection_pattern.deflection_configuration=" + ssaId;
    parFiltersArray.push({
        order: 20,
        type: "query",
        apply_to: ["ssa_deflection_metric"],
        encoded_query: metricQuery + "^" + dateQuery
    });
    var metricActivityQuery = "metric.deflection_pattern.deflection_configuration=" + ssaId;
    parFiltersArray.push({
        order: 30,
        type: "query",
        apply_to: ["ssa_deflection_metric_activity"],
        encoded_query: metricActivityQuery + "^" + dateQuery
    });
    api.setState("parFilters", parFiltersArray);
    api.setState('csvUrlConversationCount', getCsvUrl('sn_ci_analytics_st_count_by_date', encodeFilter(filter), {
        property_name: 'Conversation Count'
    }));
    api.setState('csvUrlUserCount', getCsvUrl('sn_ci_analytics_st_count_by_date', encodeFilter(filter), {
        property_name: 'User Count'
    }));
}
