(function executeRule(current, previous /*null when async*/) {

	var capability = AutoResolutionUtil.getCapabilityFromSolutionDefintion(current.getValue('ml_solution_name'));
	var solutionCapability = AutoResolutionUtil.getSolutionCapabilityToPersistInDB(capability);
	
	if (!gs.nil(solutionCapability)) {
		current.capability = solutionCapability;
		current.update();
	}
	else {
		gs.addErrorMessage(gs.getMessage("This solution capability {0} is not supported by Issue Auto-resolution.", GlideStringUtil.escapeHTML(capability)));
		current.setAbortAction(true);
		gs.setRedirect(current);
	}

})(current, previous);
