(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("You cannot create or modify or delete preconfigured rules that are part of the base system. Preconfigured rules have the Is System property enabled."));

})(current, previous);
