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
        "dataSource": "sn_cmdb_ws_ms_ci_dashboard_data_source_2",
        "id": "sn_cmdb_ws_ms_ci_dashboard_data_" + new Date().valueOf(),
        "aggregateFunction": "SUM",
        "aggregateField": "value",
        "numberFormat": {
            "abbreviationEnabled": true,
            "customFormat": true,
            "decimalPrecision": 0,
            "numberInTooltipsEnabled": true,
            "rounding": "HALF_UP",
            "thousandSeparatorEnabled": true
        },
        "axisId": "primary"
    }];
}
