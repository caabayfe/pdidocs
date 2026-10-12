(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	current.setValue("auto_sync", "true");
	current.update();

})(current, previous);
