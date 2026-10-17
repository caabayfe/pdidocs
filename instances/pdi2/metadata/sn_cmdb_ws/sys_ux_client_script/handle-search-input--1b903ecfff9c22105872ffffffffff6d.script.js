/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { handleFlatLoadType } = imports["sn_cmdb_ws.CiRelationshipViewUtils"](...arguments);
    const { fieldValue } = event.payload;
    
    await handleFlatLoadType(fieldValue);
    api.setState('filter', fieldValue);
}
