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
    const filter = {
        from_date: api.state.startDate,
        to_date: api.state.endDate,
        timestamp: Date.now()
    };

    var parFiltersArray = [{
        "order": 0,
        "type": "date",
        "start": filter.from_date,
        "end": filter.to_date
    }, {
        order: 10,
        type: "query",
        apply_to: ["sn_ci_analytics_cs_details"],
        encoded_query: `created_onBETWEENjavascript:gs.dateGenerate('${filter.from_date}','00:00:00')@javascript:gs.dateGenerate('${filter.to_date}','23:59:59')`
    }];

    api.setState("parFilters", parFiltersArray);
}
