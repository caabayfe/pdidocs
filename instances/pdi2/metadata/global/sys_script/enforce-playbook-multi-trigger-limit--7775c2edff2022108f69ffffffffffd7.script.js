(function executeRule(current, previous /*null when async*/) {
	if (current.operation() === "update" && !current[PDConstants.FIELDS.PROCESS_DEFINITION].changes) {
		return;
	}

	var useProgrammaticLimit = false; // TODO: Update when Playbook Type supports trigger configuration
	var multiTriggerLimit = useProgrammaticLimit ? gs.getProperty('com.glide.pad.core.model.multiTrigger.programmaticLimit', 10) : gs.getProperty('com.glide.pad.core.model.multiTrigger.limit', 10);
	var playbookIdOfTrigger = current.getValue(PDConstants.FIELDS.PROCESS_DEFINITION);

	var existingTriggersForPlaybook = new GlideRecord(PDConstants.TABLES.PD_TRIGGER_INSTANCE);
	existingTriggersForPlaybook.addQuery(PDConstants.FIELDS.PROCESS_DEFINITION, playbookIdOfTrigger);
	existingTriggersForPlaybook.query();

	if (existingTriggersForPlaybook.getRowCount() <= parseInt(multiTriggerLimit)) return;

	gs.addErrorMessage(
		gs.getMessage('You have reached the maximum of {0} triggers for this playbook. Please remove one before adding a new trigger.', [multiTriggerLimit]));
	current.setAbortAction(true);
})(current, previous);
