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

    var autoResolutionContextDateFilter = "sys_created_onBETWEENjavascript:gs.dateGenerate('" + startDate + "','00:00:00')@javascript:gs.dateGenerate('" + endDate + "','23:59:59')";

    var autoResolutionContextFilter = {
        order: 1,
        type: "query",
        apply_to: ['sys_cs_auto_resolution_context'],
        encoded_query: autoResolutionContextDateFilter,
        "filterId": "autoResolutionContextFilter"
    };
    var filters = [dateFilter, autoResolutionContextFilter];
    var dashboardFilters = {
        parFilters: filters
    };
    api.setState("dashboardFilters", JSON.stringify(dashboardFilters));
}
