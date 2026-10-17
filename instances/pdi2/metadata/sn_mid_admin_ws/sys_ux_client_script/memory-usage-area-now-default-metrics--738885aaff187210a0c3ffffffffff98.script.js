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
        "dataSource": "dsIdMidMaxMemoryPercentUsage",
        "id": "metricIdMidMaxMemUsage",
        "aggregateFunction": "AVG",
        "aggregateField": "max_used_pct",
        "numberFormat": {
            "customFormat": true,
            "decimalPrecision": 1,
        },
        "axisId": "primary"
    }];
}
