/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {


            const tableName = api.context.props.table;

            // Construct data source (mb table) to pass into the line chart
            const dataSource = [
                {
                "isDatabaseView": false,
                "allowRealTime": true,
                "label": tableName,
                "sourceType": "metricBase",
                "table": tableName,
                "id": "bWV0cmljQmFzZW1iX2RlbW9fZHJvbmUxNjMyODI0NzExMjkx"
                }
            ];

            api.setState("data_sources", dataSource);
}
