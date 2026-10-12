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

    const {
        payload
    } = event.payload;
    let ciClass = payload.data.elements[0];
    let encodedQuery = payload.params.query;
    let type = getFieldValueFromEncodedQuery(encodedQuery, 'ci_category.type');

    const customPayload = {
        route: 'cloud-and-non-cloud-resources',
        params: {
            ciClass: ciClass,
            type: type
        }
    };

    api.emit('NAV_ITEM_SELECTED', customPayload);
}
