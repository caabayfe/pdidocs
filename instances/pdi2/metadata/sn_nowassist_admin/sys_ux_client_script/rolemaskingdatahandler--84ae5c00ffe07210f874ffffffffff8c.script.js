/**
 * @param {params} params
 * @param {api} params.api
 * @param {any} params.event
 * @param {any} params.imports
 * @param {ApiHelpers} params.helpers
 */
async function handler({
    api,
    event,
    helpers,
    imports
}) {
    var roleMaskingList = api.data.get_role_masking_data_for_skill_config_1?.output;
    api.setState('roleMaskingList', roleMaskingList);
    api.setState('hideRoleMaskingSection', roleMaskingList.allowAllSessionRoles ? false : !roleMaskingList?.roles?.length);
    api.setState('disableTurnOn', api.state.edit_access_skill_data.allowEditingRMRoles && (roleMaskingList.allowAllSessionRoles === true ? false : !roleMaskingList?.roles?.length));
    var roleMaskingDisabled = roleMaskingList.roles.length ? !roleMaskingList.roles.some(role => role.scope ? role.scope == roleMaskingList?.currentApplicationId : true) : false;
    api.setState('roleMaskingDisabled', roleMaskingDisabled);
    if (roleMaskingDisabled) {
        let firstRole = roleMaskingList.roles[0];
        api.setState('roleMaskingDisabledMessage', await helpers.translate(
            "To edit the roles please change the application scope to {scope}", {
                scope: firstRole.scope_name ? firstRole.scope_name : firstRole.scope
            }
        ));
    }
}
