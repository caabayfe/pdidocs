function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}

	if (newValue === '' || oldValue != newValue)
		g_form.setValue("assigned_to", "");
}
