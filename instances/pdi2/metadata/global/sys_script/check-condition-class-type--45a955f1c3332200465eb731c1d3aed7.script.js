(function executeRule(current, previous /*null when async*/) {
	if (current.getValue('condition_class') !== 'd8e8f83a0a0a2c940052a3cac6c2b417') //Simple Condition Class
		return;

	if ((current.getValue("when_to_resume") === 'on_condition') || (current.getValue("when_to_cancel") === 'on_condition') || (current.getValue("when_to_cancel") === 'never')) {
		gs.addErrorMessage(gs.getMessage('{0} - Unable to change the Condition Type to SLAConditionSimple as there are existing values set for When to cancel / When to resume conditions. Update aborted.', current.getValue('name')));
		current.setAbortAction(true);
	}
})(current, previous);
