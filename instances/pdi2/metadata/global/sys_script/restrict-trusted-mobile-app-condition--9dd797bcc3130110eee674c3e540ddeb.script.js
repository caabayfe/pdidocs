(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	gs.addErrorMessage(gs.getMessage("You must enable the Device Trust Flow before using Trusted Mobile app in Pre Authentication Policy Context."));
	current.setAbortAction(true);
	
})(current, previous);
