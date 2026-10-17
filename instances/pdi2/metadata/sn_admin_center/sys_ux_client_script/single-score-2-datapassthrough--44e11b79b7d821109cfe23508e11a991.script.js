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
            "value": api.state.appsNeedUpdate,
            "change": "0",
            "changePercent": "0"
        }],
        "metadata": {
            "dataSourceLabel": "",
            "eventData": {
                "table": ""
            },
            "groupBy": [{
                "series": [],
                "elements": [],
                "id": "assignment_group",
                "fieldType": "reference",
                "label": "Assignment group"
            }],
            "format": {
                "unitFormat": "{0}"
            },
            "aggregateBy": 4,
            "metricId": ""
        }
    }];
}
