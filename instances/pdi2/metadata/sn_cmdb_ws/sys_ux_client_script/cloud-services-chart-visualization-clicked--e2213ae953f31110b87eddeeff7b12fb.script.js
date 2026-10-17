/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        getFieldValueFromEncodedQuery
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();

    let cloudProvider = event.payload.data.elements[0];
    let encodedQuery = event.payload.params.query;

    let ciClass = getFieldValueFromEncodedQuery(encodedQuery, 'ci_category.ci_class');
    let params = {
        ciClass: ciClass,
        type: null,
        cloudProvider: cloudProvider
    };

    api.emit('CONTENT_UPDATED', {
        params
    });

    api.setState("cloudServicesChartParams", params);
}
