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
    const {
        ACLValidationUtil
    } = imports['sn_nowassist_admin.ACLValidationUtil']();

    var skillDetails = api.context.props.payload.guided_context;
    var result = ACLValidationUtil.fetchMissingRoles(skillDetails, skillDetails.aclData || []);
    api.setState('isValidRoles', result?.isValid);
    let message = Object.entries(result?.missingRoles).map(([key, roles]) => `${key}: ${roles.join(',')}`).join(', ');
    api.setState('missingRoleMessage', await helpers.translate(
        "The following roles are configured here but not in the ACLs. {message}", {
            message: message
        }
    ));
/**
 * Setting Default roles for NAP
 */
api.setState("napEnabled", skillDetails.nap_status.nowAssistPanelEnabled);
if (!!skillDetails.nap_skill_applicability) {
    // if nap_skill_applicability has comma separated value, then it has multiple gen AI skill applicability 
    api.setState("multipleNAPRecord", skillDetails.nap_skill_applicability.includes(","));
}

if (!!skillDetails.nap_skill_applicability) {
    if (!!skillDetails.ce_roles) {
        let roles = skillDetails.ce_roles.split(",").map(role => ({
            id: role,
            label: role
        }));
        api.setState("defaultNAPRoles", roles);
    } else if (!!skillDetails.ce_roles_mandatory) {
        api.setState("openNAPRoleSettings", true);
        api.setState("napUserRolesInvalid", true);
        api.setState("napUserRolesAlert", [{
            "status": "critical",
            "content": skillDetails.translated_text.delivery_user_role_mandatory
        }]);
        api.emit("ACE_ACTION_PERFORMED", {
            eventName: 'SN_NS_ADMIN_DISABLE_NEXT'
        });
    }
}

/**
 * Setting Default roles for In Product
 */
if (!!skillDetails.in_product_roles) {
    let roles = skillDetails.in_product_roles.split(",").map(role => ({
        id: role,
        label: role
    }));
    api.setState("defaultInProductRoles", roles);
}

/**
 * Setting Default roles for Mobile
 */
if (!!skillDetails.in_mobile_roles) {
    let roles = skillDetails.in_mobile_roles.split(",").map(role => ({
        id: role,
        label: role
    }));
    api.setState("defaultMobileRoles", roles);
}
}
