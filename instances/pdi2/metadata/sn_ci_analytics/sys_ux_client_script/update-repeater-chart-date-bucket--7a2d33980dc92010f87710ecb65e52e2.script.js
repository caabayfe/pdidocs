/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 */
function handler({api, event, helpers, imports}) {
    const { itemId, selectedBucket } = event.payload;
    const eventProperties = api.state.eventProperties && api.state.eventProperties.length 
        ? api.state.eventProperties
        : api.data.get_custom_event_properties.transformEventProperties;

    let modifiedProp = eventProperties.filter(e => e.id === itemId).pop();
    if (!modifiedProp) return;
    
    const updatedProp = JSON.parse(JSON.stringify(modifiedProp)); // deep copy
    const chartConfig = updatedProp.parConfiguration;
    let chartDataConfig = chartConfig.dataConfigurations;
    if (typeof chartDataConfig === 'string')
        chartDataConfig = JSON.parse(chartDataConfig);

    const filter = chartDataConfig[0].filter_query; // encoded query
    const {
        encodeFilter,
        decodeFilter,
        getCsvUrl
    } = imports['sn_ci_analytics.VADasboardUtils']();

    const decodedFilter = decodeFilter(filter).filter;
    decodedFilter.date_bucket = selectedBucket.id;

    let newEncodedFilter = encodeFilter(decodedFilter);
    chartDataConfig[0].filter_query = newEncodedFilter;

    chartConfig.dataConfigurations = JSON.stringify(chartDataConfig);
    updatedProp.parConfiguration = chartConfig;
    updatedProp.downloadLinkHref = getCsvUrl(chartDataConfig[0].source_id, newEncodedFilter);
    updatedProp.selectedDateBucket = selectedBucket.id;

    const newEventProps = eventProperties.map(function(prop) {
        if (prop.id === itemId) return updatedProp;
        return prop;
    });

    api.setState('eventProperties', newEventProps);
}
