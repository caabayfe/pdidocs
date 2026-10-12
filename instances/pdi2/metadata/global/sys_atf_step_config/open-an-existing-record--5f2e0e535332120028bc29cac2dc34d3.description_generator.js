(function generateDescription(step) {
	var descriptor = new ATFStepDescriptionGenerator();
	var description = descriptor.getOpenFormDescription(step.inputs.table, step.inputs.view, step.inputs.record_id.getDisplayValue(), step.inputs.form_ui);

	if (step.warning_message)
		description += "\n\n" + step.warning_message;

	return description;
})(step);
