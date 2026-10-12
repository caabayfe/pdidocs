(function executeRule(current, previous /*null when async*/ ) {

    //Restrict policies using User Based MFA & Role Based MFA Filter in Policy Conditions to Auth Policy Context.
    var defaultPolicy = current.default_policy;
    var policyCriteria = new GlideAggregate("sys_authentication_policy_criteria_m2m");
    policyCriteria.addAggregate('COUNT');
    policyCriteria.addQuery('policy', current.getValue(defaultPolicy));
    //query element name for User Based MFA & Role Based MFA Filter
    policyCriteria.addQuery('sys_auth_filter_criteria.sys_id', 'IN', '6956fd56c7312010df1417b703c260dc,c326b116c7312010df1417b703c2601d');
    policyCriteria.addQuery('used', true);
    policyCriteria.query();

    if (policyCriteria.next() && parseInt(policyCriteria.getAggregate('COUNT')) > 0) {
        gs.addErrorMessage(gs.getMessage("Policies using User Based MFA and Role Based MFA Filters in Policy conditions cannot be added to Authentication Policy Context"));
        current.setAbortAction(true);
        return;
    }

})(current, previous);
