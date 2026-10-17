function onLoad() {
	g_form.getControl("state_model").onChange = stateModelOnChange;
	
	populateStateChoices(false);
}

function stateModelOnChange(control, oldValue, newValue, isLoading, isTemplate) {
	populateStateChoices(true);
}

function populateStateChoices(clearSelection) {
	currentSelectionValue = g_form.getValue("state");
	g_form.clearOptions("state");
	
	var choices = g_scratchpad.stateChoices;
	for (var key in choices){
		g_form.addOption("state", key, choices[key]);
	}

	if (!clearSelection && currentSelectionValue)
		g_form.setValue("state", currentSelectionValue);
}
