(function executeRule(current, previous /*null when async*/) {
	var changeModel = new ChangeModel(current.chg_model.getRefRecord());
	var stateField = changeModel.getStateFieldName();

	// If the model has changed and the state field hasn't, set the initial state value.
	// This is the same behaviour as the form.
	if (current.chg_model.changes() && !current[stateField].changes()) {
		changeModel.applyInitialState(current, true);
		return;
	}

	var initialState = changeModel.getInitialStateValue();
	var stateValue = current.getValue(changeModel.getStateFieldName());

	//Check if the change state is either the initial state or one of the transitionable states from initial
	if (stateValue === initialState || changeModel.getTransitionStatesValues(initialState).indexOf(stateValue) !== -1)
		return;

	// If it's a state that's not in this model set initial state
	changeModel.applyInitialState(current, true);
})(current, previous);
