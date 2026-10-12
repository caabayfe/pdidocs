/**
  * @param {params} params
  * @param {api} params.api
  * @param {TransformApiHelpers} params.helpers
  */
function evaluateProperty({api, helpers}) {
	return [
  {
    "data": [
      {
        "value": api.data.deduplication_template_get_all_tasks_count_1.output.totalTasks,
        "change": "0",
        "changePercent": "0"
      }
    ],
    "metadata": {
      "eventData": {
        "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
      },
      "previousScoreDate": "1642809600000",
      "dataSourceLabel": '',
      "aggregate": {
        "fieldType": "decimal"
      },
      "format": {
        "unitFormat": "{0}",
        "frequency": "daily",
        "precision": 0,
      }
    }
  }
];
}
