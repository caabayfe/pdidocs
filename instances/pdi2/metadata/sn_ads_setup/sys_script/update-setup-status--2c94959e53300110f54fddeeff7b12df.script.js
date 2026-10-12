(function executeRule(current, previous /*null when async*/) {
	var setupService = new SNHelpSetupService();
	setupService.updateSetupInteraction(current);
})(current, previous);
