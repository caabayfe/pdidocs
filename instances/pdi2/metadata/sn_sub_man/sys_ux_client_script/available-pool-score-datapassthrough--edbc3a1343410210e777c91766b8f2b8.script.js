/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [{
        "data": [{
            "change": "0",
            "changePercent": "0",
            "value": api.state.availablePoolCapacity
        }],
        "metadata": {
            "aggregate": {
                "fieldType": "decimal"
            },
            "changeArrow": "steady",
            "dataSourceLabel": "",
            "eventData": {
                "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
            },
            "filterQuery": "",
            "format": {
                "frequency": "daily",
                "precision": 2,
                "unitFormat": "{0}"
            },
            "previousScoreDate": "1642809600000",
            "scoreDate": "1642896000000"
        }
    }];
}
