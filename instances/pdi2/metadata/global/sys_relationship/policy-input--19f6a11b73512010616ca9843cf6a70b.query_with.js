(function refineQuery(current, parent) {

	var policyGr = parent.stepup_mfa_policy;
    if (parent.getValue('default_policy') == 'stepdown_mfa_policy') {
        policyGr = parent.stepdown_mfa_policy;
    }
    current.addQuery("policy", policyGr.sys_id);

})(current, parent);
