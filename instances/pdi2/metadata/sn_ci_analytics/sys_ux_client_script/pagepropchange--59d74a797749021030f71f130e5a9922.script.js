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
    var dateFilter = {
        "order": 0,
        "type": "date",
        "start": api.context.props.startDate,
        "end": api.context.props.endDate,
        "apply_to": [],
    };
    api.setState("parFilters", [dateFilter, ...api.state.appliedFilters]);
}
