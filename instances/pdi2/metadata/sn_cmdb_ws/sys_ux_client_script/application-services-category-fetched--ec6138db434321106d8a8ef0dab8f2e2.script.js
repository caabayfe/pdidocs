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
    const {
        getApplicationServicesCategories
    } = imports['sn_cmdb_ws.cmdbWSInsightUtil']();

    var data = api.data.get_application_services_categories.output.categoryResults;
    var categories = getApplicationServicesCategories(data);

    api.setState('appServicesCategories', categories);
}
