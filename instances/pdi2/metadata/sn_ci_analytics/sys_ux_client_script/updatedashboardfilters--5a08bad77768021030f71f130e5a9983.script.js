/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let {
        startDate,
        endDate,
        encodedQuery
    } = api.context.props;
    var dateFilter = {
        "order": 0,
        "type": "date",
        "start": startDate,
        "end": endDate,
        "filterId": "pardashboardfilter"
    };
    var activeUserDateFilter = "created_onBETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')";

    var activeUsersFilter = {
        order: 1,
        type: "query",
        apply_to: ['sn_ci_analytics_cs_details'],
        encoded_query: activeUserDateFilter,
        "filterId": "activeUsersFilter"
    };
    var filters = [dateFilter, activeUsersFilter];
    var dashboardFilters = {
        parFilters: filters
    };
    api.setState("dashboardFilters", JSON.stringify(dashboardFilters));
}
