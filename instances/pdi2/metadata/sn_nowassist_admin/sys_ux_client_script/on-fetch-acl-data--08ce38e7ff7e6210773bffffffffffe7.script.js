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
    api.emit('ACE_ACTION_PERFORMED', {
        eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
        eventPayload: {
            variableName: 'aclData',
            variableValue: {
                'can_write': api.data.get_acl_data_for_skill_config_1.output.canWrite,
                'aclData': api.data.get_acl_data_for_skill_config_1.output.aclData,
                'aclScopeData': api.data.get_acl_data_for_skill_config_1.output.aclScopeData
            }
        }
    });
    var skillDetails = api.context.props.payload.guided_context;
    api.setState('allowEditingRMRoles', skillDetails.allowEditingRMRoles);
    api.setState('roleMaskingData', skillDetails.roleMaskingData);
    var roleMaskingDisabled = skillDetails.roleMaskingData.roles.length ? !skillDetails.roleMaskingData.roles.some(role => role.scope ? role.scope === skillDetails.roleMaskingData?.currentApplicationId : true) : false;
    api.setState('roleMaskingDisabled', roleMaskingDisabled);
    if (roleMaskingDisabled) {
        let firstRole = skillDetails.roleMaskingData.roles[0];
        api.setState('roleMaskingDisabledMessage', await helpers.translate(
            "To edit the roles please change the application scope to {scope}", {
                scope: firstRole.scope_name ? firstRole.scope_name : firstRole.scope
            }
        ));
    }
    let aclData = api.data.get_acl_data_for_skill_config_1.output.aclData || [];
    const {
        ACLValidationUtil
    } = imports['sn_nowassist_admin.ACLValidationUtil']();

    var result = ACLValidationUtil.fetchMissingRoles(skillDetails, aclData);
    api.setState('isValidRoles', result?.isValid);
    let message = Object.entries(result?.missingRoles).map(([key, roles]) => `${key}: ${roles.join(',')}`).join(', ');
    api.setState('missingRoleMessage', await helpers.translate(
        "The following roles are configured here but not in the ACLs. {message}", {
            message: message
        }
    ));
}
