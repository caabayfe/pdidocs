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
        "dataSource": "dsIdtop5maxMemoryPercentUsage",
        "id": "metricIdTop5maxMemoryPercentUsage",
        "aggregateFunction": "AVG",
        "aggregateField": "max_used_pct",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
}
