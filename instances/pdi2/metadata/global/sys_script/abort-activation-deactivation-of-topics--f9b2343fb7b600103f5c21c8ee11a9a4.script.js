(function executeRule(current, previous) {
	var interActive = gs.isInteractive();
	if (interActive) {
		current.setAbortAction(false); // Allow updating from forms UI page
	}
	else {
		gs.addErrorMessage(gs.getMessage("Activation/Deactivation of a topic on the server side is restricted"));
		current.setAbortAction(true);
	}
})(current, previous);
