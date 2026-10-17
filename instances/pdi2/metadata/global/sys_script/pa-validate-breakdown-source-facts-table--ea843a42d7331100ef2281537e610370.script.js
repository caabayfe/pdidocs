if (SNC.PAScore.breakdownSourceHasScores(current.sys_id)) {
	gs.addErrorMessage(gs.getMessage("Frequency cannot be changed because there are breakdowns using this breakdown source that have scores"));
	current.setAbortAction(true);
}
