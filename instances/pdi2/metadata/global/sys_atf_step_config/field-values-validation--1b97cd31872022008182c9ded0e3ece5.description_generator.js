(function generateDescription(step) {
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description;

	if (!step.inputs.form_ui || step.inputs.form_ui.toString() === "standard_ui")
		description = gs.getMessage("Validate that the form matches the following condition:") + "\n";
	else
		description = gs.getMessage("Validate that the form in '{0}' matches the following condition:", step.inputs.form_ui.getDisplayValue()) + "\n";

	description += descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.conditions);
	description += descriptionGenerator.getTimeoutDescription(step.timeout);
	return description;
})(step);
