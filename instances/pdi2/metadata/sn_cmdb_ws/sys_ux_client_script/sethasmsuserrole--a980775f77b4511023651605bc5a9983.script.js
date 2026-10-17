/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {
        hasMsUser,
        hasAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();
    
    if(!hasMsUser(api.context.session.user.roles) && (!hasAdminOrMaint(api.context.session.user.roles))) {
        api.setState('hasMsUserRole',false);
    }
}
