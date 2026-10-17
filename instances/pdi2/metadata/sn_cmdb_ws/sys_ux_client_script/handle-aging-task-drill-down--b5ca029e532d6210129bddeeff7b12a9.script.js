/**
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
async function handler({api, event, helpers, imports}) {
    const {
        handleLinkClick,
        agingTaskDrillDownListNav
    } = imports["sn_cmdb_ws.cmdbWSCommonUtil"]();
    const {
        hasDataManagerAdminOrAdminOrMaint
    } = imports["sn_cmdb_ws.userRoleUtils"]();

    var isAdmin = hasDataManagerAdminOrAdminOrMaint(api.context.session.user.roles);
    var value = await agingTaskDrillDownListNav(event, helpers, isAdmin);
    handleLinkClick(helpers, value);
}
