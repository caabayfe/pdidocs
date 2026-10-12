(function generateDescription(step) {
	var description = gs.getMessage("Generate string of length: {0}", step.inputs.length.getDisplayValue());
	return description;
})(step);
