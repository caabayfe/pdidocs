/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return {
        "trendByFrequency": "minute",
        "trendByMinuteInterval": 15,
        "trendByFields": [{
            "field": "time_range_start",
            "metric": "EXECUTION_METRIC_ID"
        }]
    };
}
