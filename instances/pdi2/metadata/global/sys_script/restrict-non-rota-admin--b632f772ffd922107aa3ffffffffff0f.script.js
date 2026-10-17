(function executeRule(current, previous /*null when async*/) {
    var tru = new TriggerRuleUtil();
    var groupFieldName = tru.getDefaultGroupField(current.getValue('table'));
	var triggerFields = (current.getValue('trigger_fields') + '').split(',');
	if (triggerFields.includes(groupFieldName)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Security constraints prevent this operation"));
	}

})(current, previous);
