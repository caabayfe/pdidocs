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
            "metric": "EVENT_AVG_PROCESSING_DURATION_METRIC_ID"
        }, {
            "field": "sys_created_on",
            "metric": "EVENT_AVG_LAG_ID"
        }, {
            "field": "sys_created_on",
            "metric": "EVENT_CREATED_EVENTS_ID"
        }, {
            "field": "sys_created_on",
            "metric": "EVENT_ERROR_EVENTS_ID"
        }, {
            "field": "sys_created_on",
            "metric": "EVENT_HANDLER_EXECUTION_COUNT_ID"
        }, {
            "field": "sys_created_on",
            "metric": "EVENT_PROCESSED_EVENTS_ID"
        }, {
            "field": "sys_created_on",
            "metric": "EVENT_UNPROCESSED_EVENTS_ID"
        }, {
            "field": "sys_created_on",
            "metric": "EVENT_TRANSFERRED_EVENTS_ID"
        }]
    };
    return trendBy;
}
