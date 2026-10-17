/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { itemId, selectedView } = event.payload;
    const {
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();

    const eventProperties = api.state.eventProperties && api.state.eventProperties.length 
        ? [...api.state.eventProperties]
        : [...api.data.get_custom_event_properties.transformEventProperties];

    const modifiedProp = eventProperties.filter(e => e.id === itemId).pop();
    if (!modifiedProp) return;

    const chartConfig = modifiedProp.parConfiguration;
    let chartDataConfig = chartConfig.dataConfigurations;
    if (typeof chartDataConfig === 'string')
        chartDataConfig = JSON.parse(chartDataConfig);

    if (selectedView === 'chart-donut' && chartConfig.chartType !== 'donut') {
        // chart view changed from line to donut
        chartConfig.chartType = 'donut';
        delete chartDataConfig[0]['trend_field'];
        delete chartDataConfig[0]['trend_interval'];
        chartConfig.dataConfigurations = JSON.stringify([{
            ...chartDataConfig[0],
            chart_settings: { 
                color: {
                    type: 'palette',
                    sys_id: '1ff0e8a75b6d2010af608e1fb681c7a6'
                } 
            },
            source_id: 'sn_ci_analytics_st_property_summary_by_event',
            group_by: 'property_value'
        }]);
        modifiedProp.downloadLinkHref = getCsvUrl(
            'sn_ci_analytics_st_property_summary_by_event', 
            chartDataConfig[0].filter_query
        );
    } else if (selectedView === 'chart-line' && chartConfig.chartType !== 'line') {
        // chart view changed from donut to line
        chartConfig.chartType = 'line';
        chartConfig.dataConfigurations = JSON.stringify([{
            ...chartDataConfig[0], 
             chart_settings: { 
                color: {
                    type: 'palette',
                    sys_id: 'ca67da805b522010af608e1fb681c7c0'
                } 
             },
            source_id: 'sn_ci_analytics_st_event_property_value_trend',
            aggregate_field: 'count',
            group_by: 'property_value',
            trend_field: 'date',
            trend_interval: 'date'
        }]);
        modifiedProp.downloadLinkHref = getCsvUrl(
            'sn_ci_analytics_st_event_property_value_trend', 
            chartDataConfig[0].filter_query
        );
    }

    modifiedProp.showDateBucketSelector = (selectedView === 'chart-line');

    api.setState('eventProperties', eventProperties);
}
