function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	//Type appropriate comment here, and begin script below
	if (newValue == "string" || newValue == "template") {
		g_form.setValue("allow_add_info", false);
	}
}


	
