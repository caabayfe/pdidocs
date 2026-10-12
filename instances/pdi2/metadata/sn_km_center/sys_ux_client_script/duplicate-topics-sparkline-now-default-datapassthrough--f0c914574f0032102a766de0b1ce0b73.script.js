/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
    var output = api.data.duplicate_topics_timeseries_input.output;
    var topicsHistory = output ? output: null;
	return [
    {
        "data": topicsHistory,
        "metadata": {
            "eventData": {
                "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
            },
            "dataSourceLabel": "Duplicate Topics Time Series History",
            "series": [
                {
                    "label": "Duplicate Topics Time Series History",
                    "id": "value",
                    "type": "value"
                }
            ],
            "aggregate": {
                "fieldType": "decimal"
            },
            "format": {
                "unitFormat": "{0}",
                "frequency": "monthly",
                "precision": 0
            }
        }
    }
]
;
}
