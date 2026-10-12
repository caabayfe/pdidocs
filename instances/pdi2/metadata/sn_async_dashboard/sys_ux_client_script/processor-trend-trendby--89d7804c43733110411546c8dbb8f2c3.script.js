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
            "metric": "PROCESSOR_IDLE_COUNT_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "PROCESSOR_RUN_COUNT_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "PROCESSOR_QUEUED_COUNT_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "PROCESSOR_PROCESSED_COUNT_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "PROCESSOR_EXECUTION_DURATION_ID"
        }, {
            "field": "sys_created_on",
            "metric": "PROCESSOR_MAX_EXECUTION_DURATION_ID"
        }, {
            "field": "sys_created_on",
            "metric": "PROCESSOR_MIN_EXECUTION_DURATION_ID"
        }]
    };

    return trendBy;
}
