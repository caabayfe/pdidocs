function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    if (g_scratchpad.useSchedules) {
        g_form.setDisplay("calendar", false);
        g_form.setDisplay("timezone_source", true);

		if (newValue === "inactivity_monitor") {
			g_form.setDisplay("timezone", true);
			g_form.setMandatory("timezone", true);
		} else {
			g_form.setMandatory("timezone", false);
			g_form.setDisplay("timezone", false);
		}

		if (newValue === "inactivity_monitor" || newValue === "schedule_tz" && g_form.getValue("schedule_source") === "inactivity_monitor") {
			g_form.setDisplay("schedule", true);
			g_form.setMandatory("schedule", true);
		} else {
			g_form.setMandatory("schedule", false);
			g_form.setDisplay("schedule", false);
		}

		if (newValue === "task_field") {
			g_form.setDisplay("timezone_source_field", true);
			g_form.setMandatory("timezone_source_field", true);
		} else {
			g_form.setMandatory("timezone_source_field", false);
			g_form.setDisplay("timezone_source_field", false);
		}
    } else {
        g_form.setDisplay("calendar", true);
        g_form.setDisplay("schedule_source", false);
        g_form.setDisplay("schedule", false);
        g_form.setMandatory("schedule_source_field", false);
        g_form.setDisplay("schedule_source_field", false);
        g_form.setDisplay("timezone", false);
        g_form.setDisplay("timezone_source", false);
        g_form.setMandatory("timezone_source_field", false);
        g_form.setDisplay("timezone_source_field", false);
    }
}
