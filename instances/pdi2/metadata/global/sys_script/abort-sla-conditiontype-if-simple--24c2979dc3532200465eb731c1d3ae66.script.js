(function executeRule(current, previous /*null when async*/) {
	var slaDefinition = new GlideRecord('contract_sla');
	slaDefinition.addEncodedQuery('when_to_cancelINon_condition,never^ORwhen_to_resume=on_condition^condition_class=NULL'); 

	slaDefinition.query();
	if (slaDefinition.getRowCount() > 0) {
		gs.addErrorMessage(gs.getMessage('Unable to change the Condition Type to SLAConditionSimple as there are existing SLA definitions that use When to cancel / When to resume conditions.' ));
		current.setAbortAction(true);
	}
})(current, previous);
