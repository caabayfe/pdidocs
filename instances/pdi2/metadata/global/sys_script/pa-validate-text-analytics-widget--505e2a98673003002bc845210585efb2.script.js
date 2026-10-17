(function executeRule(current, previous /*null when async*/) {

	if (!new SNC.PAUtils().isPremium()) {
		gs.addErrorMessage(gs.getMessage("You must license Performance Analytics to create text widgets"));
		current.setAbortAction(true);
	}

})(current, previous);
