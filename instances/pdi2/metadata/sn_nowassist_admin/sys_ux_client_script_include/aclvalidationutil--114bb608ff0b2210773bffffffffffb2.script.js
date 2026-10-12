function include({
    imports
}) {
    class ACLValidationUtil {
        static fetchMissingRoles(skillDetails, aclData) {
            aclData = aclData.filter(item => item.active === "1");
            let aclRoles = [];
            let hasUserIsAuthenticated = false;
            let isValid = false;
            let missingRoles = {};

            for (const acl of aclData) {
                if (acl.securityAttribute === "UserIsAuthenticated") {
                    hasUserIsAuthenticated = true;
                    break;
                }
                aclRoles.push(...acl.roles);
            }

            aclRoles = [...new Set(aclRoles)];

            if (!hasUserIsAuthenticated) {

                const toRoleArray = (val) =>
                   Array.isArray(val) ? 
                   val : 
                   typeof val === "string" ? val.trim() === "" ? [] : val.split(",") : [];

                const inProductRoles = toRoleArray(skillDetails?.in_product_roles);
                const ceRoles = toRoleArray(skillDetails?.ce_roles);
                const inMobileRoles = toRoleArray(skillDetails?.in_mobile_roles);
                const coreUiRoles = skillDetails?.isGeneratedFromSkillKit ?
                    toRoleArray(skillDetails?.ui_action_roles) : [];

                const getMissingRoles = (expectedRoles) =>
                    expectedRoles.filter(role => !aclRoles.includes(role));

                const ceEnabled = skillDetails?.isGeneratedFromSkillKit ?
                    (skillDetails?.nap_status?.nowAssistPanelEnabled && skillDetails?.nap_active) || skillDetails?.va_active:
                    skillDetails?.nap_status?.nowAssistPanelEnabled && skillDetails?.nap_active;

                const isInProductValid = !skillDetails?.in_product_active || getMissingRoles(inProductRoles).length === 0;
                const isInMobileValid = !skillDetails?.in_mobile_active || getMissingRoles(inMobileRoles).length === 0;
                const isCoreUiValid = !skillDetails?.ui_action_active || getMissingRoles(coreUiRoles).length === 0;
                const isCeValid = !ceEnabled || getMissingRoles(ceRoles).length === 0;

                isValid = isInProductValid && isInMobileValid && isCoreUiValid && isCeValid;

                if (!isInProductValid) {
                    missingRoles["In-product"] = getMissingRoles(inProductRoles);
                }
                if (!isInMobileValid) {
                    missingRoles["Mobile"] = getMissingRoles(inMobileRoles);
                }

                if (!isCoreUiValid) {
                    missingRoles["Core UI"] = getMissingRoles(coreUiRoles);
                }
                if (!isCeValid) {
                    if (skillDetails?.isGeneratedFromSkillKit) {
                        missingRoles["Conversational experiences"] = getMissingRoles(ceRoles);
                    } else {
                        missingRoles["Now Assist panel"] = getMissingRoles(ceRoles);
                    }
                }
            }

            return {
                isValid: hasUserIsAuthenticated || isValid,
                missingRoles: missingRoles
            };
        }
    }

    return {
        ACLValidationUtil
    };
}
