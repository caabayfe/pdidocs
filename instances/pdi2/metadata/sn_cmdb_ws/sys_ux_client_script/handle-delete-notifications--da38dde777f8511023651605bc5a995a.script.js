/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    if (event && event.payload && event.payload.data && event.payload.data.output) {
        const {
            error,
            status
        } = event.payload.data.output;
        const {
            handleDeleteQueryNotifications
        } = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();
        
        handleDeleteQueryNotifications(api,helpers,status,error);
    }

}
