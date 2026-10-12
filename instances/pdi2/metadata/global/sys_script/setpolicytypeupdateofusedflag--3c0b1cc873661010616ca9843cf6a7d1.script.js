(function executeRule(current, previous /*null when async*/ ) {

    // If the current record is updadted to be 'USED' to 'true' then update the policy type accordingly
    if (current.used == true) {

        // If the policy is not already of post auth type. then if the the Policy Input is of User(Role, Group) Criteria , then the corresponding Policy will be of Post Auth
        if (current.policy.type != "post_auth") {
            // If the record update is any of User(Role, Group) Criteria , then the corresponding Policy will be of Post Auth.
            if (GlideDBObjectManager.get().getAllExtensions('user_based_filter_criteria').contains(current.sys_auth_filter_criteria.sys_class_name)) {
                updateAuthPolicyType("post_auth");
            }
            // If the new record insertion is of System(IP) Criteria, and No User(Role, Group) Criteria is associated to the Policy 
            // then the corresponding Policy will be of type Pre Auth.
            else if (GlideDBObjectManager.get().getAllExtensions('system_based_filter_criteria').contains(current.sys_auth_filter_criteria.sys_class_name) && current.policy.type != "pre_auth") {
                updateAuthPolicyType("pre_auth");
            }
        }


    } 
	else { // If the current record is updadted to be 'USED' to 'false' then update the policy type accordingly
        // get the count of policy inputs which are being used
        var roleCriteriaCountForPolicy = getFilterCriteriaCountAssociatedWithPolicy("sys_role_filter_criteria");
        var groupCriteriaCountForPolicy = getFilterCriteriaCountAssociatedWithPolicy("sys_group_filter_criteria");
        var genericUserCriteriaCountForPolicy = getFilterCriteriaCountAssociatedWithPolicy("sys_generic_user_filter_criteria");

        if (roleCriteriaCountForPolicy == 0 && groupCriteriaCountForPolicy == 0 && genericUserCriteriaCountForPolicy == 0) {
            var ipCriteriaCountForPolicy = getFilterCriteriaCountAssociatedWithPolicy("sys_ip_filter_criteria");
            var locationCriteriaCountForPolicy = getFilterCriteriaCountAssociatedWithPolicy("sys_location_filter_criteria");
            var genericSystemCriteriaCountForPolicy = getFilterCriteriaCountAssociatedWithPolicy("sys_generic_system_filter_criteria");

            // It was of PostAuth Type, check if it needs to be reset to 'PreAuth' or 'any' type.
            if (GlideDBObjectManager.get().getAllExtensions('user_based_filter_criteria').contains(current.sys_auth_filter_criteria.sys_class_name)) {
                if (ipCriteriaCountForPolicy > 0 || locationCriteriaCountForPolicy > 0 || genericSystemCriteriaCountForPolicy > 0) {
                    updateAuthPolicyType("pre_auth");
                } else {
                    updateAuthPolicyType("any");
                }
            }
            // It was of PreAuth Type, check if it needs to be reset to 'any' type.
            else if (GlideDBObjectManager.get().getAllExtensions('system_based_filter_criteria').contains(current.sys_auth_filter_criteria.sys_class_name)) {
                if (ipCriteriaCountForPolicy == 0 && locationCriteriaCountForPolicy == 0 && genericSystemCriteriaCountForPolicy == 0) {
                    updateAuthPolicyType("any");
                }
            }
        }
    }


    function updateAuthPolicyType(policyType) {
        var gr = new GlideRecord("sys_authentication_policy");
        if (gr.isValid()) {
            gr.get(current.policy.sys_id);
            if (gr.isValidRecord()) {
                gr.setValue("type", policyType);
                gr.update();
            }
        }
    }

    function getFilterCriteriaCountAssociatedWithPolicy(filterCritriaClassName) {
        var ga = new GlideAggregate("sys_authentication_policy_criteria_m2m");
        if (ga.isValid()) {
            ga.addAggregate("COUNT");
            ga.addQuery("policy", current.policy.sys_id);
            ga.addQuery("sys_auth_filter_criteria.sys_class_name", filterCritriaClassName);
            ga.addQuery("used", true);
            ga.query();

            var res = 0;
            if (ga.next())
                res = ga.getAggregate("COUNT");

            return res;
        }
    }

})(current, previous);
