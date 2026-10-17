/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const { ERROR_NOTIFICATION_PROPS} = imports["sn_cmdb_ws.cmdbMultisourceUtil"]();
    api.setState('isDirty',true);

    api.emit('NOW_UXF_PAGE#ADD_NOTIFICATIONS', {
        items: [{
            ...ERROR_NOTIFICATION_PROPS,
            "content": await helpers.translate("Failed to save multisource settings")
        }]
    });
    
}
