function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || !g_form.isLiveUpdating())
		return;

	if (g_scratchpad.isUpdatingState)
		return;

	updateStateOptions();
	if (newValue != oldValue)
		$$('button[data-action-name^=state_model]').each(function(e) { e.hide(); });
	else
		$$('button[data-action-name^=state_model]').each(function(e) { e.show(); });

	function updateStateOptions(){		
		var stateModel = g_scratchpad.stateModel;
		if (!stateModel)
			return;

		var typeStateModel = stateModel[g_form.getValue("type")];
		if (!typeStateModel)
			return;

		var currentStateValue = g_form.getValue('state');
		var currentStateName = stateModel.stateNameByValue[currentStateValue];
		if (!currentStateName)
			return;

		var currentStateInModel = typeStateModel[currentStateName];
		if (!currentStateInModel)
			return;

		g_scratchpad.isUpdatingState = true;

		var nextStates = currentStateInModel.nextState;

		g_form.clearOptions('state');
		g_form.addOption('state', currentStateValue, stateModel.stateLabelByValue[currentStateValue]);

		for (var i = 0; i < nextStates.length; i++)
			addStateOptionByName(nextStates[i], stateModel);

		g_scratchpad.isUpdatingState = false;
	}

	function addStateOptionByName(stateName, stateModel) {
		if (!stateName || !stateModel)
			return;

		var stateValue = stateModel.stateValueByName[stateName];
		if (!stateValue)
			return;

		var stateDisplayValue = stateModel.stateLabelByValue[stateValue];
		if (!stateDisplayValue)
			return;

		g_form.addOption('state', stateValue, stateDisplayValue);
	}
}
