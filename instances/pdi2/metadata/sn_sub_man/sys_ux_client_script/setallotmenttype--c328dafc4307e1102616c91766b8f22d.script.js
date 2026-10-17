/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const customTableAllotments = api.data.license_cust_table_allotment.results;
    const allotmentType = (customTableAllotments && customTableAllotments.length > 0 && customTableAllotments[0].allotmentType != null) ?
        customTableAllotments[0].allotment_type.value :
        '-1';
    api.setState('allotmentType', allotmentType);
}
