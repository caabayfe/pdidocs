(function executeRule(current, previous /*null when async*/) {

	if (parseFloat(current.cost) < 0) {
		gs.addErrorMessage(gs.getMessage("The value of cost should be positive"));
		current.setAbortAction(true);
	}

})(current, previous);
