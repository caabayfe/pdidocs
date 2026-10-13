(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord("sn_em_arm_additional_info");
    if (gr.isValid()) {
        var query = gr.addQuery("alert_management_rule", current.sys_id);
        query.addOrCondition("dependent_on_rule", current.sys_id);
        gr.query();

        while (gr.next()) {

            var sysId = gr.alert_management_rule;
            var dependentRuleAssnGrp = (sysId == current.sys_id) ? gr.dependent_on_rule.assignment_group : gr.alert_management_rule.assignment_group;

            if (current.assignment_group !== dependentRuleAssnGrp) {
                gs.addErrorMessage(gs.getMessage("Cannot change assignment group as the rule has dependency on another rule assigned to {0} group. Please remove the rule dependency before changing assignment group.", previous.assignment_group));
                current.setAbortAction(true);
            }

        }
    }

})(current, previous);
