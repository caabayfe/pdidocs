/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, imports, helpers}) {
    const {
        updateDataFetchState
    } = imports["sn_cmdb_ws.ExploreCIUtils"](...arguments);
    const {
        parseErrorFromEvent
    } = imports["sn_cmdb_ws.CMDBWsErrorUtil"]();
    const {
        dataElemId: resourceId
    } = event.payload;
    const error = await parseErrorFromEvent({ event, helpers });
    updateDataFetchState(resourceId, false, error);
}
