(function executeRule(current, previous /*null when async*/) {
	var gd = new GlideDuration('');
	gd.setDisplayValue(current.default_value);
	if (gd.hasDate()) {
		current.default_value = gd.getDurationValue();
		return;
	}
	var gdt = new GlideDateTime(current.default_value);
	if (gdt.hasDate()) {
		gd = new GlideDuration(gdt.getNumericValue());
		current.default_value = gd.getDurationValue();
		return;
	}
	current.setAbortAction(true);
	current.default_value.setError('Invalid default value');
	gs.addErrorMessage(gs.getMessage("Invalid Default value '{0}'", [current.default_value]));
})(current, previous);
