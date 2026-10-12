(function executeRule(current, previous /*null when async*/) {
	var refUtils = new global.SPMRefUtils();

	if (refUtils.isPortfolioLayerLocked(current.spm_service_portfolio)) {
		gs.addErrorMessage(gs.getMessage('Lowest level layer is already defined and attached to services'));
		current.setAbortAction(true);
	}
})(current, previous);
