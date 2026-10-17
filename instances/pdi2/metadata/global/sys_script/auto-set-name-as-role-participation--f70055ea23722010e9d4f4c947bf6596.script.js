(function executeRule(current, previous /*null when async*/) {

	if (current.isActionAborted())
		return;
	// Add your code here
	current.name = current.role.getDisplayValue() + "." + current.participation.getDisplayValue();

})(current, previous);
