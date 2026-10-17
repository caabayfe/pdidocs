/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    var count = [
        {
            "data": [
                {
                    "value": api.data.deduplication_template_get_orphan_count.output.count,
                    "change": "0",
                    "changePercent": "0"
                }
            ],
            "metadata": {
                "eventData": {
                    "indicatorSysid": "fb007202d7130100b96d45a3ce6103b4"
                },
                "previousScoreDate": "1642809600000",
                "dataSourceLabel": api.data.deduplication_template_get_orphan_count.output.label,
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

    api.setState('orphanTasksCount', count);
}
