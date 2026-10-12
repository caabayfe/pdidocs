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
    const {item} = event.payload;
    const isDesc = item.id == 'descending' ? true :false;
    api.setState('isDesc', isDesc);
    resetPaginationIndexes();
}
