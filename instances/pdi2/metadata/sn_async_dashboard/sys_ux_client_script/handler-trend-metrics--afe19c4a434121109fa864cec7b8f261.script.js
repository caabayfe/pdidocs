/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var metrics = [{
        "dataSource": "DS_HANDLER_STATS_ID",
        "id": "HANDLER_AVERAGE_EXECUTION_DURATION_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "average_execution_duration_interval",
        "label": "Average Execution Duration (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_HANDLER_STATS_ID",
        "id": "HANDLER_ERROR_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "error_count_interval",
        "label": "Error Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_HANDLER_STATS_ID",
        "id": "HANDLER_EXECUTION_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "execution_count_interval",
        "label": "Execution Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_HANDLER_STATS_ID",
        "id": "HANDLER_EXECUTION_DURATION_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "execution_duration_interval",
        "label": "Execution Duration (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_HANDLER_STATS_ID",
        "id": "HANDLER_MAX_EXECUTION_DURATION_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "max_execution_duration_interval",
        "label": "Max Execution Duration (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_HANDLER_STATS_ID",
        "id": "HANDLER_SKIPPED_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "skipped_count_interval",
        "label": "Skipped Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
    return metrics;
}
