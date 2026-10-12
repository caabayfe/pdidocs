(function executeRule(current, previous /*null when async*/ ) {
    var ruleReviewer = new GlideRecord("ds_approval_revision_rule_reviewer");
	ruleReviewer.addQuery("approval_review_rule", current.getValue("approval_review_rule"));
	ruleReviewer.addQuery("reviewer", current.getValue("reviewer"));
	ruleReviewer.addQuery('sys_id', '!=', current.getUniqueValue());
	ruleReviewer.query();

    if (ruleReviewer.next()) {
        gs.addErrorMessage(gs.getMessage('This reviewer already exists in this rule.'));
        current.setAbortAction(true);
    }

})(current, previous);
