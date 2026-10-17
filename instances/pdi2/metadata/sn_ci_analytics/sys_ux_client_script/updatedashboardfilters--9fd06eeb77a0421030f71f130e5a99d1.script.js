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
        spokeId
    } = api.context.props;
    var dateFilter = {
        "order": 0,
        "type": "date",
        "start": startDate,
        "end": endDate,
        "apply_to":[],
        "filterId": "pardashboardfilter"
    };
     var spokeFilter = {
        "order": 1,
        "type": "choice",
        "apply_to": [{
            "key": "0336004577200210dfe21f130e5a99f5",
            "type": "pa"
        }],
        "values": spokeId ? [spokeId] : [],
        "filterId": "1ifdh6jdr0a4beago68"
    };
    
    var filters = [dateFilter,spokeFilter];
    api.setState("parFilters",filters);
    var dashboardFilters = { parFilters: filters };
    api.setState("dashboardFilters", JSON.stringify(dashboardFilters));
}
