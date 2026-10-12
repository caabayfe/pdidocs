(function executeRule(current, previous /*null when async*/) {
	current.setAbortAction(true);
	var redirectURL = AutoResolutionConstants.SIMULATION_CONFIG_TABLE_NAME + '.do?sys_id=' + current.getValue('sys_id');
	gs.setRedirect(redirectURL);
	gs.addErrorMessage(gs.getMessage("You can't delete a configuration during simulation. Please try again after the simulation completes, is cancelled, or reaches an error state."));
})(current, previous);
