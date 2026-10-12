function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}
	
	var datatype = g_form.getValue("datatype");
	if (datatype == "template") {
		g_form.setMandatory('min', false);
		g_form.setMandatory('max', false);
	} else {
		g_form.setMandatory('min', true);
		g_form.setMandatory('max', true);
	}
}
