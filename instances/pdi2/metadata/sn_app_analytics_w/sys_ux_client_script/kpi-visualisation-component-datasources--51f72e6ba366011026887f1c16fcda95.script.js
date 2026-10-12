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
        "sourceType": "paKpi",
        "kpiInfo": null,
        "kpiSysId": api.context.props.dataSourceId,
        "id": "722efc4aa3a2011026887f1c16fcda5a",
         "numberFormat": {
            "customFormat": false,
            "abbreviationEnabled": true
        },
        "axisId": "primary",
        "appliedConditions": api.state.appliedConditions,
    }];
}
