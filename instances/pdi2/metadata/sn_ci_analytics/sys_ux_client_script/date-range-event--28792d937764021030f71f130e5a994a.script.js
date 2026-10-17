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
    let {
        start,
        end,
    } = event.payload.appliedFilters[0];
    const { encodedQuery } = api.context.props;
    var dateFilter = [{
        "order": 0,
        "type": "date",
        "start": start,
        "end": end,
        "filterId": "1ilvh75orh6kc32bb1c8"
    }];
    api.setState("parFilters", dateFilter);
    if (start && end) {
        let params = {
            startDate: start,
            endDate: end
        };
        if (encodedQuery) params.encodedQuery = encodedQuery;
        api.emit("DISPATCH_PAGE_HEADER_PARAMS", params);
    }
}
