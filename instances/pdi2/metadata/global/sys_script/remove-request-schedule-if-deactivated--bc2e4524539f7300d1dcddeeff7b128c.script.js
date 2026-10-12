(function executeRule(current, previous /*null when async*/) {
	// Only attempt to delete schedule records if solution definition has just been deactivated
	if (previous.active && !current.active) {
		new MLRequestSchedule().deleteExistingCapabilityTrainingRequestSchedule(current.getUniqueValue());
	}
})(current, previous);
