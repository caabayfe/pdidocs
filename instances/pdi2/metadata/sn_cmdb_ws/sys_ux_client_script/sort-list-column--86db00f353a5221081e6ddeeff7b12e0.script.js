/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
       SORT_ASCENDING,
       SORT_DESCENDING,
       SORT_NONE,
       resetPaginationIndexes
    } = imports["sn_cmdb_ws.DataManagerCertificationDashboardUtil"](...arguments);
    const {key, sortDirection} = event.payload.column;
    const isDesc = !(sortDirection == SORT_NONE || sortDirection == SORT_DESCENDING);
    api.setState('sortByField', key);
    api.setState('isDesc', isDesc);
    resetPaginationIndexes();
}
