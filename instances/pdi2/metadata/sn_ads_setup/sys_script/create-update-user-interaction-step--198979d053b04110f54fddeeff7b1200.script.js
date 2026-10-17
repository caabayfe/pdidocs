(function executeRule(current, previous /*null when async*/) {
	var setupService = new SNHelpSetupService();
	setupService.upsertInteractionStep(current);
})(current, previous);
