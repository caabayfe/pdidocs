/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    var chartInfo = api.context.props.payload;
    return [{
        "data": chartInfo.scores,
        "metadata": {
            "format": {
                "unitFormat": "{0}"
            },
            "groupBy": [{
                "elements": [],
                "fieldType": "reference",
                "id": "label",
                "label": "Assignment group",
                "series": []
            }]
        }
    }];
}
