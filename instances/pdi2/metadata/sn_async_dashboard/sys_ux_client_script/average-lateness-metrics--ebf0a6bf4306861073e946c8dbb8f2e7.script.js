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
        "dataSource": "AVERAGE_LATENESS_ID",
        "id": "AVERAGE_LATENESS_METRIC_ID",
        "aggregateFunction": "AVG",
        "aggregateField": "avg_lateness",
        "label": "Average Wait Time (ms)",
        "numberFormat": {
            "customFormat": true,
            "abbreviationEnabled": false,
            "thousandSeparatorEnabled": false,
            "rounding": 'UP',
            "numberInTooltipsEnabled": true,
            "decimalPrecision": 0,
        },
        "axisId": "primary"
    }];
}
