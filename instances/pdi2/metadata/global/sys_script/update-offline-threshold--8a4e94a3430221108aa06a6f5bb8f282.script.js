(function executeRule(current, previous /*null when async*/) {
	current.custom_hours = current.threshold/60;
	current.custom_minutes = current.threshold%60;
	current.setWorkflow(false);
	current.update();
	current.setWorkflow(true);
})(current, previous);
