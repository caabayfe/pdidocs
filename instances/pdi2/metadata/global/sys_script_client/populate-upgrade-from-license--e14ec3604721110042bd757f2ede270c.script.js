function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(isLoading || g_form.getValue('license') == '')
		return;
	var ref = g_form.getReference("license").model;
	if(newValue != '' && newValue != ref && g_form.getValue("upgrade_parent") != ref)
		g_form.setValue("upgrade_parent", ref);
}
