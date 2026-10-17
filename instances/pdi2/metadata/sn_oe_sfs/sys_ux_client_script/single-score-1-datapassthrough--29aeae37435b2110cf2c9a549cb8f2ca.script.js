/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var data = [{
        "data": [{
            "change": "0",
            "changePercent": "0",
            "value": api.context.props.payload.props_details.progress_percentage || 0
        }],
        "metadata": {
            "aggregate": {
                "fieldType": "decimal"
            },
            "dataSourceLabel": "",
            "eventData": {
                "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
            },
            "filterQuery": "",
            "format": {
                "frequency": "daily",
                "precision": 0,
                "unitFormat": "{0}"
            }
        }
    }];
    return data;
}
