function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === 'workspace') {
		g_form.setValue('related_search_active', true);
		g_form.setReadOnly('related_search_active', true);
	} else
		g_form.setReadOnly('related_search_active', false);
}
