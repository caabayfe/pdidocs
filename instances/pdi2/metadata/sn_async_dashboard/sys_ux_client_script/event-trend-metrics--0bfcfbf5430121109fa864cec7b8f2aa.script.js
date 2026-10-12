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
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_AVG_PROCESSING_DURATION_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "average_processing_duration_interval",
        "label": "Average Processing Duration (ms)",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_AVG_LAG_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "average_lag",
        "label": "Average Lag (sec)",
        "numberFormat": {
            "customFormat": false
        }
    }, {
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_CREATED_EVENTS_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "logged_count_interval",
        "label": "Created Events",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_ERROR_EVENTS_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "error_count_interval",
        "label": "Error Events",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_HANDLER_EXECUTION_COUNT_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "handler_execution_count",
        "label": "Handler Execution Count",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_PROCESSED_EVENTS_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "processed_count_interval",
        "label": "Processed Events",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_UNPROCESSED_EVENTS_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "unprocessed_count",
        "label": "Total unprocessed",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }, {
        "dataSource": "DS_EVENT_STATS_ID",
        "id": "EVENT_TRANSFERRED_EVENTS_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "transferred_count_interval",
        "label": "Transferred events",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
    return metrics;
}
