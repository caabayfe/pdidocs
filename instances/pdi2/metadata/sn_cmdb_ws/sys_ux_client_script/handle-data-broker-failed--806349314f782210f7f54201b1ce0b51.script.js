/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { 
        parseErrorFromEvent, 
        dispatchAndLogError 
    } = imports["sn_cmdb_ws.CMDBWsErrorUtil"]();
    const errorStr = await parseErrorFromEvent({ event, helpers });
    dispatchAndLogError(errorStr, { api, helpers });
}
