(function executeRule(current, previous /*null when async*/ ) {

	var triggerRuleGr = new GlideRecord("trigger_rule");
	triggerRuleGr.addQuery("trigger_rule_table_cfg", current.getUniqueValue());
	triggerRuleGr.setLimit(1);
	triggerRuleGr.query();

	if (triggerRuleGr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Trigger rule table config is referenced by a trigger rule and cannot be deleted"));
	}

})(current, previous);
