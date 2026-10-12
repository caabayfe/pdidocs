/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var dateQuery = api.state.state_stats_date_query;
    if (dateQuery == undefined || dateQuery == null) {
        dateQuery = '';
    }
    return dateQuery + '^ORDERBYDESCinterval_start';
}
