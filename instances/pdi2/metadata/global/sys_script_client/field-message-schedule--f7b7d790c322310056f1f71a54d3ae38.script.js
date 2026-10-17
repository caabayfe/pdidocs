function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	}

	if (!newValue && g_form.getValue("schedule_source") != "sla_definition")
		g_form.showFieldMsg("schedule", getMessage("SLA will run 24x7 as no schedule is selected"), "info");
}
