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
        "dataSource": "dsIdtop5AvgCpuUsage",
        "id": "metricIdTop5AvgCpuUsage",
        "aggregateFunction": "AVG",
        "aggregateField": "mean",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
}
