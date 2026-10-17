function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === '')
		return;

	if (newValue == "no_schedule") {
		g_form.setDisplay("timezone_source", false);
		g_form.setDisplay("timezone", false);
	} else {
		g_form.setDisplay("timezone_source", true);
		if (g_form.getValue("timezone_source") === "sla.timezone")
			g_form.setDisplay("timezone", true);
	}
}
