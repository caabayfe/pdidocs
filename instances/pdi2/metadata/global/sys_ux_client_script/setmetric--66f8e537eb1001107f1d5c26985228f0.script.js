/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {

            const metricName = api.context.props.metric;
            const transformFunc = api.state.transform;

            //aggregating transforms like avg, sum, median
            const transformAgg = [
                        {
                            "metric": metricName,
                            "transform": {
                                "transform": transformFunc,
                                "input": {
                                    "transform": "Reference",
                                    "name": "chart-subjects"
                                }
                            }
                        }
                    ];

        
            const transformNone = [
                {
                "metric": metricName
                }
            ];

            let transform;

            if (transformFunc == "None") {
                transform = transformNone;
            } else {
                transform = transformAgg;
            }

            // Construct metric to pass into the line chart
            const metric = [
                {
                    "dataSource": "bWV0cmljQmFzZW1iX2RlbW9fZHJvbmUxNjMyODI0NzExMjkx",
                    "id": "YldWMGNtbGpRbUZ6WlcxaVgyUmxiVzlmWkhKdmJtVXhOak15T0RJME56RXhNamt4MTYzMjgyNDcxMjY2NQ==",
                    "transforms": transform,
                    "numberFormat": {
                        "customFormat": false
                    },
                    "axisId": "primary",
                    "label": metricName
                }
            ];

            api.setState("metric", metric);
}
