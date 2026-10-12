(function generateDescription(step) {
	var description = gs.getMessage("Log: {0}", step.inputs.log.getDisplayValue());
	return description;
})(step);
