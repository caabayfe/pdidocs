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
        "trendByFrequency": "date",
        "trendByMinuteInterval": null,
        "trendByFields": [{
            "field": "sys_created_on",
            "metric": "metricIdMidMaxMemUsage"
        }]
    };
}
