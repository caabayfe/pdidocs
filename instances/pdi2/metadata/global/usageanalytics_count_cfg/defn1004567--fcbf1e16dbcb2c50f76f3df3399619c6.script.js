answer = getPolicyCountUsingIPAuthSchemeFilters();

function getPolicyCountUsingIPAuthSchemeFilters() {
    var record = new GlideAggregate('sys_authentication_policy_criteria_m2m');
    record.addAggregate('COUNT');
    record.groupBy('policy');
    record.addQuery('used', 'true');
    record.query();
    
    var count = 0;
    
    while (record.next()) {
        //There must be atleast 2 filters criterias inorder to proceed with validation
        if (record.getAggregate('COUNT') > 1) {
            var gr = new GlideRecord('sys_authentication_policy_criteria_m2m');
            gr.addQuery('policy', record.policy);
            gr.addQuery('used', 'true');
            gr.query();
            var ip_filter_count = 0,
                auth_scheme_filter_count = 0;
            while (gr.next()) {
				if (gr.sys_auth_filter_criteria.sys_class_name == 'sys_ip_filter_criteria')
                    ip_filter_count++;
                else if (gr.sys_auth_filter_criteria.sys_class_name == 'sys_generic_user_filter_criteria' && gr.sys_auth_filter_criteria.sys_id == '535de592c7312010df1417b703c26050')
                    auth_scheme_filter_count++;
            }
            if (ip_filter_count > 0 && auth_scheme_filter_count > 0)
                count++;
        }
    }
    return count;
}
