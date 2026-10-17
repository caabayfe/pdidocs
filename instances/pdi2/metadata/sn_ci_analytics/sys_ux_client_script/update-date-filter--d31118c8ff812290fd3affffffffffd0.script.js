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
    } = api.context.props;
    var dateFilter = [{
        "order": 0,
        "type": "date",
        "start": startDate,
        "end": endDate,
        "filterId": "1ilvh75orh6kc32bb1c8"
    }];
    api.setState("parFilters", dateFilter);
}
