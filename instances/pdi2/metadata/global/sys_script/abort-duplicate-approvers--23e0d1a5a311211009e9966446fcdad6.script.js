(function executeRule(current, previous /*null when async*/) {
	var ruleApprovers = new GlideRecord('ds_approval_revision_rule_approver');
	ruleApprovers.addQuery('approval_review_rule',current.getValue("approval_review_rule"));
	ruleApprovers.addQuery('approver',current.getValue("approver"));
	ruleApprovers.addQuery('sequence',current.getValue("sequence"));
	ruleApprovers.addQuery('sys_id', '!=', current.getUniqueValue());
	ruleApprovers.query();
	
	if (ruleApprovers.next()) {
		gs.addErrorMessage(gs.getMessage("This approver with same sequence already exists in this rule."));
		current.setAbortAction(true);
	}
})(current, previous);
