function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '')
		return;
	var ref = g_form.getReference("license").model;
	if(g_form.getValue("downgrade_child") != ref && g_form.getValue("upgrade_parent") != ref) {
		g_form.clearValue("downgrade_child");
		g_form.clearValue("upgrade_parent");
	}
}
