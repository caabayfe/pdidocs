(function executeRule(current, previous /*null when async*/) {
	gs.addErrorMessage(gs.getMessage("Invalid Action Step: 'Local save' type is supported only when Applicable for is 'Offline'."));
	current.setAbortAction(true);
})(current, previous);
