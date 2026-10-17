function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	//Type appropriate comment here, and begin script below
	if(g_form.getValue("metric_type") != "")
		g_form.setReadOnly("metric_type", true);
}
