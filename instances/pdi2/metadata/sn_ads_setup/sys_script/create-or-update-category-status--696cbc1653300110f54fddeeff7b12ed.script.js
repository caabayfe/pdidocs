(function executeRule(current, previous /*null when async*/) {
	var setupService = new SNHelpSetupService();
	setupService.upsertParentStepInteraction(current);
})(current, previous);
