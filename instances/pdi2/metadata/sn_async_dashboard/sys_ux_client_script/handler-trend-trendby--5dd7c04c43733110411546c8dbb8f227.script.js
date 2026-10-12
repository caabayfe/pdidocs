/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var trendBy = {
        "trendByFrequency": "minute",
        "trendByMinuteInterval": 60,
        "trendByFields": [{
            "field": "sys_created_on",
            "metric": "HANDLER_AVERAGE_EXECUTION_DURATION_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "HANDLER_ERROR_COUNT_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "HANDLER_EXECUTION_COUNT_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "HANDLER_EXECUTION_DURATION_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "HANDLER_MAX_EXECUTION_DURATION_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "HANDLER_SKIPPED_COUNT_METRIC_ID"
        }]
    };
    return trendBy;
}
