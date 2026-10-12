(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addErrorMessage(gs.getMessage("An input generator output can only be used in action input if the Set Action Input Dynamically is checked. Please remove the reference to the input generator to continue"));
	current.setAbortAction(true);

})(current, previous);
