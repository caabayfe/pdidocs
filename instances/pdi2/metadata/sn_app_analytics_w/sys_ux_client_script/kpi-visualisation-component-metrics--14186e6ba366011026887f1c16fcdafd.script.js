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
        "id": "1",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary",
        "dataSource": "722efc4aa3a2011026887f1c16fcda5a", //this value should be same as the "id" we pass in the datasources
    }];
}
