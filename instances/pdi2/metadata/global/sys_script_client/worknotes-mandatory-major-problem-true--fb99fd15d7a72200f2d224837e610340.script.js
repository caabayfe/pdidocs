function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '')
		return;
	else if (newValue == oldValue)
		g_form.setMandatory("work_notes", false);
	else
		g_form.setMandatory("work_notes", true);
}
