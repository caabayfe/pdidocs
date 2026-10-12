if (SNC.PAScore.breakdownHasScores(current.sys_id)) {
	gs.addErrorMessage(gs.getMessage("Breakdown Source cannot be changed because there are scores related to this breakdown"));
	current.setAbortAction(true);
}
