(function executeRule(current, previous /*null when async*/) {
	if(typeof bypassCanCreatePTaskCheck !== 'undefined' && bypassCanCreatePTaskCheck) {
		gs.debug("current PTASK" + current.number + "Returning from BR \"Check if problem task can be created\" without executing as bypassCanCreatePTaskCheck is defined and true");
		return;
	}
	if (!(new ProblemTaskStateUtilsSNC().canCreateProblemTask(current.problem))) {
		gs.addErrorMessage(gs.getMessage("Problem Task cannot be associated to a closed Problem"));
		current.problem = '';
		current.setAbortAction(true);
	}
})(current, previous);
