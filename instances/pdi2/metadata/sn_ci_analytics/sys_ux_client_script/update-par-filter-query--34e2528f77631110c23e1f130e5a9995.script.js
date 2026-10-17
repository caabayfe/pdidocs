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
        encodeFilter,
        generatePARFilterQuery
    } = imports["sn_ci_analytics.VADasboardUtils"]();
    const filter = {
        from_date: startDate,
        to_date: endDate
    };
    api.setState("parFilters", generatePARFilterQuery(encodeFilter(filter), [
        "sn_ci_analytics_st_conv_completion_by_cat"
    ]));
}
