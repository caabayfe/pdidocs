function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === '' || g_form.getValue('sp_rectangle_menu_item') === '')
		return;

	if (newValue === 'filtered' || newValue === 'scripted')
		g_form.showFieldMsg("type", getMessage("Filtered/Scripted List must be a top-level Menu Item"), "error");
}
