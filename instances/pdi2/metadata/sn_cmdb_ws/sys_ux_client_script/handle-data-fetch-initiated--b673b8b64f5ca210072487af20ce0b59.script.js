/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        updateDataFetchState
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    const {
        dataElemId: resourceId
    } = event.payload;
    updateDataFetchState(resourceId, true, false);
}
