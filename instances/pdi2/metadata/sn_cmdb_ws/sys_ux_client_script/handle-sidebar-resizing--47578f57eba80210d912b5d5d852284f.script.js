/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   if (event.payload.interaction !== 'USER_ACTION')
         return;
    const resizablePaneUtils = imports['sn_cmdb_ws.CMDBWsResizablePaneUtils'](...arguments);
    resizablePaneUtils.resizePane(event.payload.dividerPosition);
}
