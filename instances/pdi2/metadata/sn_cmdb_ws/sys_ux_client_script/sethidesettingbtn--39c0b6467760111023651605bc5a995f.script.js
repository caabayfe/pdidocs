/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        hasMsAdmin,
        hasAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();
    if(!hasMsAdmin(api.context.session.user.roles) && !hasAdminOrMaint(api.context.session.user.roles)) {
        //hide settings button
        api.setState('hideSettingBtn',true);
    }
}
