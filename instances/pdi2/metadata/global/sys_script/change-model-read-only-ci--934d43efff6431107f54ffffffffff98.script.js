(function executeRule(current, previous /*null when async*/) {
	var ALLOW_CI_MODIFICATION = "allow_ci_modification";

	var changeRequest = new ChangeRequest(current);
	var preChangeRequest = new ChangeRequest(previous);
	var modelContainsAttribute = changeRequest.modelContainsAttribute(ALLOW_CI_MODIFICATION);

	// If the attribute isn't enabled preserve original 'initial state' CI changes
	if (!modelContainsAttribute && (changeRequest.isInitialState() || prevChangeRequest.isInitialState()))
		return;

	if (changeRequest.hasStateAttribute(ALLOW_CI_MODIFICATION))
		return;
	
	//try previous
	if (new ChangeRequest(previous).hasStateAttribute(ALLOW_CI_MODIFICATION))
		return;

	// Otherwise, if it's a new record lookup model and lookup attribute on the intial state
	var changeModel = new ChangeModel(current.chg_model.getRefRecord());
	if (current.isNewRecord() && changeModel.hasStateAttribute(changeRequest.getInitialState(), ALLOW_CI_MODIFICATION))
		return;

	// Abort the modification
	gs.addErrorMessage(gs.getMessage("Configuration item cannot change for Change Requests in this state"));
	current.setAbortAction(true);
})(current, previous);
