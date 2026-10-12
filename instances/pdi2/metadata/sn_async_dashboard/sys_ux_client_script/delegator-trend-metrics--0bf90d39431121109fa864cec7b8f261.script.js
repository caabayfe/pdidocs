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
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_TOTAL_EVENTS_DELEGATED_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "delegated_event_count_interval",
        "label": "Total Events Delegated",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_TOTAL_EXECUTION_TIME_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "execution_duration_interval",
        "label": "Total Execution Time (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_IDLE_RUN_COUNT_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "	idle_run_count_interval",
        "label": "Idle Run Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_DELEGATOR_RUN_COUNT_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "	run_count_interval",
        "label": "Delegator Run Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_MAX_EVENTS_DELEGATED_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "	max_delegated_count_interval",
        "label": "Maximum Events Delegated",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_MIN_EVENTS_DELEGATED_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "	min_delegated_count_interval",
        "label": "Minimum Events Delegated",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_MAX_EXECUTION_TIME_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "	max_execution_duration_interval",
        "label": "Maximum Execution Time (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_DELEGATOR_STATS_ID",
        "id": "DELEGATOR_MIN_EXECUTION_TIME_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "	min_execution_duration_interval",
        "label": "Minimum Execution Time (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
    return metrics;
}
