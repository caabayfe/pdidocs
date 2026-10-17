function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || g_form.isNewRecord())
		return;
	else if (newValue == oldValue)
		g_form.setMandatory("work_notes", false);
	else
		g_form.setMandatory("work_notes", true);
}
