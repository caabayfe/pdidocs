(function generateDescription(step) {
    var description = "";
	
	if (gs.nil(step.inputs.visible) && gs.nil(step.inputs.visible.getDisplayValue()) && gs.nil(step.inputs.not_visible) && gs.nil(step.inputs.not_visible.getDisplayValue())) {
		return gs.getMessage("This step will do nothing. Please provide at least one UI action to assert visibility or invisibility on");
	}
	
	if (!gs.nil(step.inputs.visible.getDisplayValue())) {
		description = gs.getMessage("Confirm that the following UI actions are visible: {0}", step.inputs.visible.getDisplayValue());
	}
	
	if (!gs.nil(step.inputs.not_visible.getDisplayValue())) {
		description += (description ? ("\n") : "") + gs.getMessage("Confirm that the following UI actions are not visible: {0}", step.inputs.not_visible.getDisplayValue());
	}
	
	var timeoutDescription = new ATFStepDescriptionGenerator().getTimeoutDescription(step.timeout);
	description += timeoutDescription;

	return description;
})(step);
