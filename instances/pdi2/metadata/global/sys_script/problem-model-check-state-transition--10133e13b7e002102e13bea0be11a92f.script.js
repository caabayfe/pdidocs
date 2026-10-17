(function executeRule(current, previous /*null when async*/) {
	if (!previous)
		return;
	
	var problemModel = new ProblemModel(current.prb_model.getRefRecord());
	var stateFieldName = problemModel.getStateFieldName();
	var initialStateGr = problemModel.getInitialState();
	
	// If it's a new record in the initial state, or the model has changed and it's in the initial state don't do anything.
	if ((current.isNewRecord() || current.prb_model.changes()) && current.getValue(stateFieldName) === initialStateGr.getValue("state_value"))
		return;
	
	var previousState = previous.getValue(stateFieldName);
	var previousDisplayValue = previous.getDisplayValue(stateFieldName);
	
	if ((!previousState && current.isNewRecord()) ||
		(current.prb_model.changes() && current.getValue(stateFieldName) !== initialStateGr.getValue("state_value"))) {
		previousState = initialStateGr;
		previousDisplayValue = initialStateGr.getDisplayValue("state_label");
	}
	
	// Check if we can transition between the states.
	if (!problemModel.canTransition(previousState, current)) {
		gs.addErrorMessage(gs.getMessage("Problem model '{0}' prevented state transition from {1} to {2}", [current.getDisplayValue("prb_model"), previousDisplayValue, current.getDisplayValue(stateFieldName)]));
		current.setAbortAction(true);
	}

})(current, previous);
