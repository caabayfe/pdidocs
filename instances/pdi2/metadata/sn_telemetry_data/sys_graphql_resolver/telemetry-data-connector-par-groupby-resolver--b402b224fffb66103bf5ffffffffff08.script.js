(function process(/*ResolverEnvironment*/ env) {
    const serviceNameArg = env.getArguments()['serviceName'];
    const metricNameArg = env.getArguments()['metricName'];
    
    let serviceName = null;
    let metricName = null;
    
    if (serviceNameArg) {
        const match = serviceNameArg.match(/serviceName=\{[^\}]*value=([^,\}]*)/);
        if (match && match[1]) {
            serviceName = match[1];
        }
    }
    
    if (metricNameArg) {
        const match = metricNameArg.match(/metricName=\{[^\}]*value=([^,\}]*)/);
        if (match && match[1]) {
            metricName = match[1];
        }
    }
    
    let result = [];
    
    if (serviceName && metricName) {
        try {
            const telemetryDataHandler = new TelemetryDataHandler();
            let combinedAttributes = [];
            
            try {
                const serviceNamesPayload = {
                    configuration: {
                        filterId: "instance_metadata",
                        dataType: "observability_metadata"
                    }
                };
                
                const serviceNamesResponse = telemetryDataHandler.getMetadata(serviceNamesPayload);
                let serviceNamesArray = [];
                
                if (serviceNamesResponse && Array.isArray(serviceNamesResponse.ServiceNames)) {
                    serviceNamesArray = serviceNamesResponse.ServiceNames;
                } else if (serviceNamesResponse && serviceNamesResponse.result && Array.isArray(serviceNamesResponse.result.ServiceNames)) {
                    serviceNamesArray = serviceNamesResponse.result.ServiceNames;
                }
                
                if (serviceNamesArray.length > 0) {
                    const targetService = serviceNamesArray.find(service => service.Name === serviceName);
                    
                    if (targetService && Array.isArray(targetService.ResourceAttributes)) {
                        const resourceAttributes = targetService.ResourceAttributes
                            .filter(attr => attr && typeof attr === 'string')
                            .map(attr => ({
                                id: ('StringAttributes.' + attr).replace(/\./g, '__'),
                                label: attr
                            }));
                        
                        combinedAttributes = [...resourceAttributes];
                    }
                }
            } catch (serviceError) {
                gs.warn('Failed to fetch service names: ' + serviceError);
            }
            
            try {
                const metricPayload = {
                    configuration: {
                        filterId: "metric_details",
                        serviceName: serviceName,
                        dataType: "observability_metadata_service"
                    }
                };
                
                const metricResponse = telemetryDataHandler.getMetadata(metricPayload);
                let metricsArray = [];
                
                if (Array.isArray(metricResponse)) {
                    metricsArray = metricResponse;
                } else if (metricResponse && Array.isArray(metricResponse.result)) {
                    metricsArray = metricResponse.result;
                }
                
                if (metricsArray.length > 0) {
                    const metricData = metricsArray.find(m =>
                        m.ServiceName === serviceName &&
                        m.MetricName === metricName
                    );
                    
                    if (metricData && Array.isArray(metricData.Attributes) && metricData.Attributes.length > 0) {
                        const metricAttributes = metricData.Attributes.map(attr => {
                            const prefix = attr.type === 'string' ? 'StringAttributes.' :
                                attr.type === 'number' ? 'NumberAttributes.' : 
                                attr.type === 'boolean' ? 'BooleanAttributes.' : '';
                            
                            return {
                                id: (prefix + (attr.key || '')).replace(/\./g, '__'),
                                label: attr.key || ''
                            };
                        });
                        
                        combinedAttributes = [...combinedAttributes, ...metricAttributes];
                    }
                }
            } catch (metricError) {
                gs.error('Error getting metric attributes: ' + metricError);
            }
            
            result = combinedAttributes;
            
        } catch (e) {
            gs.error('Error in PAR Groupby resolver: ' + e);
        }
    }
    
    return result;
})(env);
