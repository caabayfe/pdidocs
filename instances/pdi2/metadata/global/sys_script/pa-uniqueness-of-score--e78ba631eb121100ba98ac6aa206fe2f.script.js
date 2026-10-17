if (SNC.PAScore.exists2(current.indicator, current.breakdown, current.element, current.breakdown_level2, current.element_level2, current.start_at)) {
	current.setAbortAction(true);
	gs.addErrorMessage(gs.getMessage("Score already exists"));
}
