/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
     const {
        resetPaginationIndexes
    } = imports["sn_cmdb_ws.DataManagerCertificationDashboardUtil"](...arguments);
    const pageSize = event.payload.value;
    api.setState('pageSize', pageSize);
    resetPaginationIndexes();
}
