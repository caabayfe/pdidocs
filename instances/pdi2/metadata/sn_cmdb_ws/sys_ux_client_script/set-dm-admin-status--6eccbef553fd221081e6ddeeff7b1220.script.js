/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
   const {
        hasDataManagerAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"](...arguments);
    
    api.setState('isDMAdmin', hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles));
}
