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
        "data": [{
            "value": api.state.readyTemplatesCount,
            "change": "0",
            "changePercent": "0"
        }],
        "metadata": {
            "eventData": {
                "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
            },
            "previousScoreDate": "1642809600000",
            "dataSourceLabel": "Templates",
            "aggregate": {
                "fieldType": "decimal"
            },
            "format": {
                "abbreviationEnabled": true,
                "customFormat": true,
                "precision": 0,
                "numberInTooltipsEnabled": true,
                "rounding": "UP",
                "thousandSeparatorEnabled": true
            }
        }
    }];
}
