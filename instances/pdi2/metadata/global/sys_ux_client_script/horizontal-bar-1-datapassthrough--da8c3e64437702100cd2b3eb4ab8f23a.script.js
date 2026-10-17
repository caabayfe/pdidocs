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
        data: [{
                filter_status: 'With this data filter',
                query_type: 'Mean query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOnStats.mean
            },
            {
                filter_status: 'With this data filter',
                query_type: 'Median query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOnStats.median
            },
            {
                filter_status: 'With this data filter',
                query_type: 'Min query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOnStats.min
            },
            {
                filter_status: 'With this data filter',
                query_type: 'Max query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOnStats.max
            },
            {
                filter_status: 'Without this data filter',
                query_type: 'Mean query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOffStats.mean
            },
            {
                filter_status: 'Without this data filter',
                query_type: 'Median query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOffStats.median
            },
            {
                filter_status: 'Without this data filter',
                query_type: 'Min query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOffStats.min
            },
            {
                filter_status: 'Without this data filter',
                query_type: 'Max query time',
                value: api.state.dataFilterPerfMetrics.perfFilterOffStats.max
            }
        ],
        metadata: {
            aggregateBy: 4,
            format: {
                unitFormat: '{0}'
            },
            groupBy: [{
                    id: 'query_type',
                    label: 'query_type',
                    elements: [{
                            id: 'Max query time',
                            label: 'Max query time'
                        },
                        {
                            id: 'Min query time',
                            label: 'Min query time'
                        },
                        {
                            id: 'Mean query time',
                            label: 'Mean query time'
                        },
                        {
                            id: 'Median query time',
                            label: 'Median query time'
                        }
                    ]
                },
                {
                    id: 'filter_status',
                    label: 'filter_status',
                    elements: [{
                            id: 'With this data filter',
                            label: 'With this data filter'
                        },
                        {
                            id: 'Without this data filter',
                            label: 'Without this data filter'
                        }
                    ]
                }
            ]
        }
    }];
}
