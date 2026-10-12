/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    return [{
        "dataSource": "dsMidAvgCpuUsage",
        "id": "metricIdMidAvgCpuUsage",
        "aggregateFunction": "AVG",
        "aggregateField": "mean",
        "numberFormat": {
            "customFormat": true,
            "decimalPrecision": 1
        },
        "axisId": "primary"
    }];
}
