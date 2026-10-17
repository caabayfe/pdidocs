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
    var elementId = event.elementId;
    switch (elementId) {
        case "presentational_list_1":
            var roles = event?.payload?.cellContext?.row?.cells?.roles?.componentProps?.pills.filter(item => item?.pillValue !== 'any').map(({
                pillValue,
                pillText
            }) => ({
                id: pillValue,
                label: pillText
            }));
            api.setState('selectedAclData', {
                id: event?.payload?.cellContext?.row?.key,
                aclScopeData: event.payload?.cellContext?.row?.aclScopeData,
                roles: roles.map(item => item.id),
                securityAttribute: false,
                decisionType: "allow",
                skill_config: api.context.props.payload.guided_context.skill_config_id
            });
            api.setState('selectRolesRadioSelected', !event?.payload?.cellContext?.row?.cells?.roles?.componentProps?.pills?.some(item => item?.pillValue === 'any'));
            api.setState('selectedRoles', roles);
            helpers.modal.open('edit_acl_roles_modal');
            break;
        case "apply_button":
            helpers.modal.close('edit_acl_roles_modal');
            if (api.state.selectRolesRadioSelected) {
                api.data.update_roles_for_acl_1.execute({
                    acl_data: api.state.selectedAclData
                });
            } else {
                var selectedACLData = api.state.selectedAclData;
                selectedACLData.roles = [];
                selectedACLData.securityAttribute = true;
                selectedACLData.decisionType = "allow";
                api.data.update_roles_for_acl_1.execute({
                    acl_data: selectedACLData
                });
                api.setState('selectedAclData', selectedACLData);
            }
            break;
        case "cancel_button":
            helpers.modal.close('edit_acl_roles_modal');
            break;
        case "select_roles":
            var roles = event.payload.value;
            if (roles?.length < api.state.selectedRoles?.length) {
                // If roles are removed, check whether they are part of modality roles or not.
                if (!checkWhetherRoleCanBeRemovedFromACL(roles, api.state.selectedRoles)) {
                    helpers.modal.open("acl_role_removal_modal");
                    return;
                }
            }
            api.setState('selectedRoles', roles);
            var selectedACLData = api.state.selectedAclData;
            selectedACLData.roles = roles.map(item => item.id);
            api.setState('selectedAclData', selectedACLData);
            break;
        case "add_select_roles":
            api.setState('addSelectedRoles', event.payload.value);
            break;
        case "add_acl_button":
            helpers.modal.open("add_acl_modal");
            api.setState('addSelectRolesRadioSelected', false);
            break;
        case "save_acl_button":
            helpers.modal.close('add_acl_modal');
            var skillConfig = api.context.props.payload.guided_context.skill_config_id;
            api.data.create_allow_acl_for_skill_config_1.execute({
                skill_config: skillConfig,
                acl_data: {
                    roles: api.state.addSelectRolesRadioSelected ? api.state.addSelectedRoles.map(item => item.id) : [],
                    decisionType: "allow",
                    securityAttribute: api.state.addSelectRolesRadioSelected ? false : true
                }
            });
            break;

        case "cancel_button_add":
            helpers.modal.close('add_acl_modal');
            break;

        case "select_RM_roles_1":
            var roleMaskingData = api.state.roleMaskingData;
            const rmRoles = event.payload.value;
            roleMaskingData.roles = rmRoles
            api.setState("roleMaskingData", roleMaskingData);
            api.emit("ACE_ACTION_PERFORMED", {
                eventName: 'SN_NS_ADMIN_INPUT_VALUE_CHANGED',
                eventPayload: {
                    variableName: 'save_roleMaskingData',
                    variableValue: roleMaskingData
                }
            });
            api.emit("ACE_ACTION_PERFORMED", {
                eventName: roleMaskingData.allowAllSessionRoles ? 'SN_NS_ADMIN_ENABLE_NEXT': (rmRoles.length ? 'SN_NS_ADMIN_ENABLE_NEXT':'SN_NS_ADMIN_DISABLE_NEXT')
            });
            break;
    }

    function checkWhetherRoleCanBeRemovedFromACL(newRoleList, existingRoleList) {
        var modalityRoles = [];
        var skillConfigData = api.context.props.payload.guided_context;
        if ((skillConfigData.nap_active || skillConfigData.va_active) && skillConfigData.ce_roles) {
            modalityRoles = modalityRoles.concat(skillConfigData.ce_roles.split(","));
        }
        if (skillConfigData.in_product_active && skillConfigData.in_product_roles) {
            modalityRoles = modalityRoles.concat(skillConfigData.in_product_roles.split(","));
        }
        if (skillConfigData.in_mobile_active && skillConfigData.in_mobile_roles) {
            modalityRoles = modalityRoles.concat(skillConfigData.in_mobile_roles.split(","));
        }
        if (api.state.uiActionState && api.state.uiActionRoles?.length > 0) {
            modalityRoles = modalityRoles.concat(api.state.uiActionRoles.map(item => item.id));
        }
        var removedRole;
        var newRolesIds = newRoleList.map(item => item.id);
        existingRoleList.map(item => item.id)?.forEach((role) => {
            if (newRolesIds.indexOf(role) < 0) {
                removedRole = role;
            }
        });
        if (removedRole) {
            api.setState("roleToBeRemoved", removedRole);
        }
        // If role exists in the modality role, return false.
        return !modalityRoles.filter(i => i === removedRole).length > 0;
    }
}
