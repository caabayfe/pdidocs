/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
function handler({
    api,
    event,
    helpers,
    imports
}) {
    let headerData = api.data.application_details_header_data_broker.output;
    if (headerData) {
        const {
            content: {
                applicationData: {
                    name
                }
            },
            copyLink,
            breadcrumb
        } = headerData;
        api.setState('pageUrl', copyLink);
        api.setState('applicationName', name);
        api.setState('breadcrumbData', breadcrumb);
        if (headerData.content.businessObjectiveData && headerData.content.businessObjectiveData.name)
            api.setState('buisnessObjectiveName', headerData.content.businessObjectiveData.name);
    }
}
