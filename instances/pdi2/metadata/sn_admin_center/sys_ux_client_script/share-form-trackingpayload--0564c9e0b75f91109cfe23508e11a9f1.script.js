/**
 * @param {params} params
 * @param {api} params.api
 * @param {TransformApiHelpers} params.helpers
 */
function evaluateProperty({
    api,
    helpers
}) {
    const trackingPayload = {
        page: 'app-details',
        applicationName: api.state.applicationName
    };
    const headerData = api.data.application_details_header_data_broker.output;
    if (headerData) 
        trackingPayload.businessObjectiveName = headerData.content.businessObjectiveData.name;
    
    return trackingPayload;
}
