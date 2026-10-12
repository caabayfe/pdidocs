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
        "dataSource": "DS_TOTAL_ACTIVE_PROCESSING_FRAMEWORK_JOB_COUNT_ID",
        "id": "TOTAL_ACTIVE_PPROCESSING_FRAMEWORK_JOB_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "actual_jobs",
        "numberFormat": {
            "customFormat": true,
            "decimalPrecision": 0
        },
        "axisId": "primary"
    }];
    return metric;
}
