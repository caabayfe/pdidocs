(function generateDescription(step) {
	var description = gs.getMessage("Generated an email with subject: {0}", step.inputs.subject.getDisplayValue());
	return description;
})(step);
