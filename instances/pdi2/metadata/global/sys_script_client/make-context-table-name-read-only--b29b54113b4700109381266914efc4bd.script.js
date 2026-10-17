function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	// This is a borrowed field from activity context reference.
	// It should be readonly, always
	g_form.setMandatory('activity_context.context_table', false);
	g_form.setReadOnly('activity_context.context_table', true);
}
