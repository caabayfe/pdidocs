(function executeRule(current, previous /*null when async*/ ) {

    // Check if the Policy input being deleted is used/associated with any of the sys_auth_policy_condition(s),
	// If being used, should prohibit the deletion and an error message need to be shown.
    var ga = new GlideAggregate("sys_auth_policy_condition");
    if (ga.isValid()) {
        ga.addAggregate("COUNT");
        ga.addQuery('decision_table', current.policy.decision_table);
        ga.addQuery('condition', 'CONTAINS', current.sys_auth_filter_criteria.element_name);
        ga.query();

        var res = 0;
        if (ga.next())
            res = ga.getAggregate("COUNT");

        if (res > 0) {
            current.setAbortAction(true);
            gs.addErrorMessage(gs.getMessage("Failed to delete Policy Input '{0}' as it is referenced in one or more Policy Conditions, associated with policy '{1}'. Please review the conditions before deleting.", [current.sys_auth_filter_criteria.name, current.policy.name]));
        }
    }

})(current, previous);
