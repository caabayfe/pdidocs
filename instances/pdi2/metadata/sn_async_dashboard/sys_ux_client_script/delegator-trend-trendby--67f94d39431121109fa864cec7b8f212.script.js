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
            "metric": "DELEGATOR_TOTAL_EVENTS_DELEGATED_ID"
        }, {
            "field": "sys_created_on",
            "metric": "DELEGATOR_TOTAL_EXECUTION_TIME_ID"
        }, {
            "field": "sys_created_on",
            "metric": "DELEGATOR_IDLE_RUN_COUNT_ID"
        }, {
            "field": "sys_created_on",
            "metric": "DELEGATOR_MAX_EVENTS_DELEGATED_ID"
        }, {
            "field": "sys_created_on",
            "metric": "DELEGATOR_MIN_EVENTS_DELEGATED_ID"
        }, {
            "field": "sys_created_on",
            "metric": "DELEGATOR_MAX_EXECUTION_TIME_ID"
        }, {
            "field": "sys_created_on",
            "metric": "DELEGATOR_MIN_EXECUTION_TIME_ID"
        }, {
            "field": "sys_created_on",
            "metric": "DELEGATOR_DELEGATOR_RUN_COUNT_ID"
        }]
    };
    return trendBy;
}
