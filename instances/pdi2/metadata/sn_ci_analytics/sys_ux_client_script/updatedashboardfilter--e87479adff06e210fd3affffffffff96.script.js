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
    var filters = [dateFilter];
    var dashboardFilters = { parFilters: filters };
    api.setState("dashboardFilters", JSON.stringify(dashboardFilters));
}
