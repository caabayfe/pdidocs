/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	var metric = [{
        "dataSource": "DS_TOTAL_PROCESSED_COUNT_ID",
        "id": "TOTAL_PROCESSED_METRIC_ID",
        "aggregateFunction": "COUNT",
        "aggregateField": "",
        "numberFormat": { 
            "customFormat": true,
            "rounding":"HALF_EVEN",
            "abbreviationEnabled" : true
        },
        "axisId": "primary"
    }];
    return metric;
}
