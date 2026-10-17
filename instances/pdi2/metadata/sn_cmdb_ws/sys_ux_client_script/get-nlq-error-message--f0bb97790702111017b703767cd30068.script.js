/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { invalidQueryError } = imports['sn_cmdb_ws.cmdbNlqSearchUtil']();
    const invalidQueryErrorMsg = await invalidQueryError(helpers);
    api.setState('showNlqSearchNotification', true);
    api.setState('nlqSearchNotificationContent', invalidQueryErrorMsg);
}
