function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == "no_schedule") {
        g_form.showFieldMsg("schedule_source", getMessage("SLA will run 24x7 as no schedule is selected"), "info");
		g_form.setValue('schedule', '');
	} else {
		g_form.hideFieldMsg("schedule");
	}
}
