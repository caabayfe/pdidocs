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
    const query = api.state.state_alerts_query_with_params_using_updated_on;
    if (query != undefined && query != null && query != '') {
        alertsActiveQuery = alertsActiveQuery + '^' + query;
    }
    var data = [{
        "isDatabaseView": false,
        "allowRealTime": false,
        "sourceType": "table",
        "label": {
            "message": "Total active alerts"
        },
        "tableOrViewName": "sysevent_alert",
        "filterQuery": alertsActiveQuery,
        "id": "DS_TOTAL_ALERT_COUNT_ID"
    }];
    return data;
    return '';
}
