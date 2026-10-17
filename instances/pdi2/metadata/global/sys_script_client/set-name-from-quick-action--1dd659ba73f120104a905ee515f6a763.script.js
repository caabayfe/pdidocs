function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '' || g_form.getValue('name') != '') {
		return;
	}
	var actionName = g_form.getDisplayBox('quick_action').value;
	g_form.setValue('name', actionName);
}
