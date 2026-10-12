(function executeRule(current, previous /*null when async*/) {
	if (!gs.hasRole('maint')) {
		gs.addErrorMessage(gs.getMessage("You cannot delete this property. VA issues may occur."));
		current.setAbortAction(true);
	}
})(current, previous);
