(function generateDescription(step) {
	var descriptionGenerator = new ATFStepDescriptionGenerator();
	var description;

	if (!step.inputs.form_ui || step.inputs.form_ui.toString() === "standard_ui")
		description = gs.getMessage("Set the following values on the form:") + "\n";
	else
		description = gs.getMessage("Set the following values on the form in '{0}':", step.inputs.form_ui.getDisplayValue()) + "\n";

	description += descriptionGenerator.getConditionDescription(step.inputs.table, step.inputs.field_values);

	if (step.inputs.form_ui && step.inputs.form_ui.toString() !== "standard_ui" && step.timeout)
		description += descriptionGenerator.getTimeoutDescription(step.timeout);

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
})(step);
