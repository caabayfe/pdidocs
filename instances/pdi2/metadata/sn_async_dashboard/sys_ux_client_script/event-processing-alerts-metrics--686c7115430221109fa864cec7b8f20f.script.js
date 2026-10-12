/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var metric = [{
        "dataSource": "DS_TOTAL_ALERT_COUNT_ID",
        "id": "TOTAL_ALERT_COUNT_METRIC_ID",
        "aggregateFunction": "COUNT",
        "aggregateField": "",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
    return metric;
}
