(function generateDescription(step) {
	var descriptor = new ATFStepDescriptionGenerator();
	return descriptor.getOpenFormDescription(step.inputs.table, step.inputs.view, null, step.inputs.form_ui);
})(step);
