/**
 * Check user can add a team
 * 
* @param {params} params
* @param {api} params.api
* @param {any} params.event
* @param {any} params.imports
* @param {ApiHelpers} params.helpers
*/
function handler({api, event, helpers, imports}) {
    const {output: { "sn_sow_srm.srm_responder": canAddTeam}} = api.data.check_for_user_roles_1;
    const {output: { "active": pluginActive }} = api.data.team_provisioning_plugin_status;
    api.setState('canAddTeam', !!canAddTeam && !!pluginActive);
}
