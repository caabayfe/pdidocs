/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        hasMsEditor,
        hasAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();
    
    if(!hasMsEditor(api.context.session.user.roles) && (!hasAdminOrMaint(api.context.session.user.roles))) {
        api.setState('hideCreateQuerytBtn',true);
    } 
}
