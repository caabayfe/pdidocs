(function generateDescription(step) {
    var description = "";
	
	if (gs.nil(step.inputs.visible) && gs.nil(step.inputs.not_visible)) {
		description = gs.getMessage("This step will do nothing. Please provide at least one UI action to assert as visible or not visible.");
		return description;
	}

	var isStandardFormUI = !step.inputs.form_ui || step.inputs.form_ui.toString() === "standard_ui";
	if (!isStandardFormUI)
		description = gs.getMessage("Assert the following in '{0}':\n", step.inputs.form_ui.getDisplayValue());

	if (!gs.nil(step.inputs.visible)) {
		description += gs.getMessage("Confirm that the following UI actions are visible: {0}", step.inputs.visible.getDisplayValue());
	}
	
	if (!gs.nil(step.inputs.not_visible.getDisplayValue())) {
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following UI actions are not visible: {0}", step.inputs.not_visible.getDisplayValue());
	}
	
	var timeoutDescription = new ATFStepDescriptionGenerator().getTimeoutDescription(step.timeout);
	description += timeoutDescription;

	return description;
})(step);
