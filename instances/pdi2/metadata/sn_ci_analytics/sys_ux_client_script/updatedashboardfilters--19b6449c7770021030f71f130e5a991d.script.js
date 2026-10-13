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
        topicCategoryId
    } = api.context.props;
    var dateFilter = {
        "order": 0,
        "type": "date",
        "start": startDate,
        "end": endDate,
        "apply_to": [],
        "filterId": "pardashboardfilter"
    };

    var topicCategoryFilter = {
        "order": 1,
        "type": "choice",
        "apply_to": [{
            "key": "d452021c77233110dfe21f130e5a9935",
            "type": "pa"
        }],
        "values": topicCategoryId ? [topicCategoryId] : [],
        "filterId": "1ifdetetkk51da194b88"
    };
    var filters = [dateFilter, topicCategoryFilter];
    api.setState("parFilters", filters);

    var dashboardFilters = {
        parFilters: filters
    };
    api.setState("dashboardFilters", JSON.stringify(dashboardFilters));
}
