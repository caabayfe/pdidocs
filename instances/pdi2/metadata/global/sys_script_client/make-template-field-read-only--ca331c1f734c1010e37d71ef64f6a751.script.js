function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(g_form.getValue("template")) {
		g_form.setReadOnly("template", true);
	}
}
