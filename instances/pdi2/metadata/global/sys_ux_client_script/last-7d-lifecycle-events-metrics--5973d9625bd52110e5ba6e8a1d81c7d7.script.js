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
        "dataSource": "dsIdtop5LifecycleEvent",
        "id": "metricIdTop5LifecycleEvent",
        "aggregateFunction": "COUNT",
        "numberFormat": {
            "customFormat": false
        },
        "axisId": "primary"
    }];
}
