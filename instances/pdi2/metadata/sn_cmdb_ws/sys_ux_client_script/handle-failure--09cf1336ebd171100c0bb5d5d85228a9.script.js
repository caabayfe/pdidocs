/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler(context) {
    const {
        imports
    } = context;
    const {
        parseErrorFromEvent,
        dispatchAndLogError
    } = imports["sn_cmdb_ws.CMDBWsDMErrorUtil"]();
   const error = await parseErrorFromEvent(context);
   dispatchAndLogError(error, context);
}
