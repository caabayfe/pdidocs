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
        "dataSource": "EXECUTION_ID",
        "id": "EXECUTION_METRIC_ID",
        "aggregateFunction": "SUM",
        "aggregateField": "count",
        "label": "Execution Count",
        "numberFormat": {
            "customFormat": true,
            "thousandSeparatorEnabled": false,
		    "rounding": 'UP',
		    "numberInTooltipsEnabled": true,
		    "decimalPrecision": 0,
        },
        "axisId": "primary"
    }];
}
