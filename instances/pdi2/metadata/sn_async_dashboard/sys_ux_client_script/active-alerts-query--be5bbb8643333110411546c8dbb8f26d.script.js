/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var alertsActiveQuery = "active=true";
    const query = api.state.state_alerts_query_with_params;
    if (query != undefined && query != null) {
        alertsActiveQuery = alertsActiveQuery + '^' + query;
    }
    return alertsActiveQuery;
}
