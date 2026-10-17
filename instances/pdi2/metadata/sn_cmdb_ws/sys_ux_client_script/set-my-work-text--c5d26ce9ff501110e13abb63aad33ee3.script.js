/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        hasDataManagerAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();
    const isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);
    if(isAdmin) {
        api.setState("myWorkCustomText", await helpers.translate("The tasks that you see are either assigned to you, people or groups you manage, or need your attention as a Data Manager Administrator."));
    }
    else {
        api.setState("myWorkCustomText", await helpers.translate("The tasks that you see are either assigned to you, a group that you belong to, or people or groups you manage."));
    }
}
