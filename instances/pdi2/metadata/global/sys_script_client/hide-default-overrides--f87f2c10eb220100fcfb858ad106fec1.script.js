function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading)
		return;
	
	if (newValue == 'default_override')
		g_form.showRelatedList("contact_default_override");
	else
		g_form.hideRelatedList("contact_default_override");
}
