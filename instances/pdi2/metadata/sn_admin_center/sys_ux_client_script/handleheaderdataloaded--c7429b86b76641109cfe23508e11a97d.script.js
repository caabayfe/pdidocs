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
    let headerData = api.data.admin_center_business_objective_details_header_data_broker.output;
    if (headerData) {
        const {
            content: {
                businessObjectiveData: {
                    name
                }
            },
            copyLink,
            breadcrumb
        } = headerData;
        api.setState('pageUrl', copyLink);
        api.setState('businessObjectiveName', name);
        api.setState('breadcrumbData', breadcrumb);
    }
}
