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
        "dataSource": "DS_TOTAL_COUNT_ID",
        "id": "TOTAL_COUNT_METRIC_ID",
        "aggregateFunction": "COUNT",
        "aggregateField": "",
        "numberFormat": {
            "customFormat": true,
            "rounding":"HALF_EVEN",
            "abbreviationEnabled" : true
        },
        "axisId": "primary"
    }];
    return metric;
}
