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
        startDate,
        endDate
    } = api.context.props;
    const {
        getDaysDelta
    } = imports["sn_ci_analytics.dateUtils"]();
    const {
        encodeFilter,
        generatePARFilterQuery,
        getCsvUrl
    } = imports["sn_ci_analytics.VADasboardUtils"]();
    const filter = {
        from_date: startDate,
        to_date: endDate,
        timestamp: Date.now()
    };
    var parFiltersArray = generatePARFilterQuery(encodeFilter(filter), api.state.tables);
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
    api.setState("daysDelta", getDaysDelta(startDate, endDate));
    api.setState("parFilters", parFiltersArray);
    api.setState("csvUrlDeflectionsCount", getCsvUrl('ssa_deflection_metric', metricQuery + "^" + dateQuery, {
        property_name: 'Deflections Count'
    }));
}
