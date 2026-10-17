(function refineQuery(current, parent) {

	var policyGr = parent.allow_policy;
    if (parent.getValue('default_policy') == 'deny_policy') {
        policyGr = parent.deny_policy;
    }
    current.addQuery("decision_table", policyGr.decision_table.sys_id);

})(current, parent);
