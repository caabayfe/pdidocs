/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var query = api.state.state_processor_stats_list_filter;
    if (query == undefined || query == null) {
        query = '';
    }
    return query + '^ORDERBYDESCinterval_start';
}
