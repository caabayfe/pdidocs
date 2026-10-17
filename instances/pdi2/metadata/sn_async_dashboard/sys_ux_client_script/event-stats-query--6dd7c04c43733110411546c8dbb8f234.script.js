/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var query = api.state.state_stats_query_with_params;
    if (query == undefined || query == null) {
        query = '';
    }
    return query + '^ORDERBYDESCinterval_start';
}
