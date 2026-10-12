function onBefore() {
	current.variable_prefix.setError('Variable Prefix can no longer contain underscore character.');
	current.setAbortAction(true);
}
