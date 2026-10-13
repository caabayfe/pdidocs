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
        topicId
    } = api.context.props;
    
    var dateFilter = {
        "order": 0,
        "type": "date",
        "start": startDate,
        "end": endDate,
        "apply_to": [],
        "filterId": "pardashboardfilter"
    };

    var topicFilter = {
        "order": 1,
        "type": "choice",
        "apply_to": [{
            "key": "51cca08977a00210dfe21f130e5a9991",
            "type": "pa"
        }],
        "values": topicId ? [topicId] : [],
        "filterId": "1i98c6s0j9bgpbgq6s7g"
    };
    var filters = [dateFilter,
        topicFilter
    ];
    api.setState("parFilters", filters);
    var dashboardFilters = {
        parFilters: filters
    };
    api.setState("dashboardFilters", JSON.stringify(dashboardFilters));
}
