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
        "dataSource": "DS_PROCESSOR_STATS_ID",
        "id": "PROCESSOR_IDLE_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "idle_run_count_interval",
        "label": "Idle Run Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_PROCESSOR_STATS_ID",
        "id": "PROCESSOR_RUN_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "run_count_interval",
        "label": "Total Run Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_PROCESSOR_STATS_ID",
        "id": "PROCESSOR_QUEUED_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "queued_count_interval",
        "label": "Queued Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_PROCESSOR_STATS_ID",
        "id": "PROCESSOR_PROCESSED_COUNT_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "processed_count_interval",
        "label": "Processed Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_PROCESSOR_STATS_ID",
        "id": "PROCESSOR_EXECUTION_DURATION_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "execution_duration_interval",
        "label": "Execution Duration (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_PROCESSOR_STATS_ID",
        "id": "PROCESSOR_MAX_EXECUTION_DURATION_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "max_execution_duration_interval",
        "label": "Maximun Execution Duration (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_PROCESSOR_STATS_ID",
        "id": "PROCESSOR_MIN_EXECUTION_DURATION_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "min_execution_duration_interval",
        "label": "Minimun Execution Duration (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
    return metrics;
}
