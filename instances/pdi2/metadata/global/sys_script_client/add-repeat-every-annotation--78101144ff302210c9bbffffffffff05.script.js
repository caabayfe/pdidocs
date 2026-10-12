function onChange(control, oldValue, newValue, isLoading, isTemplate) {

    if (newValue === '' || newValue == null) {
        return;
    }
	g_form.hideFieldMsg('repeat_every');

    if (newValue === '11') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N days. For example, if repeat every is set to 2, the job will repeat every 2 days"), "info");
        return;
    }

    if (newValue === '3') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N weeks. For example, if repeat every is set to 2, the job will repeat every 2 weeks. The job considers Monday as the start of the week."), "info");
        return;
    }

    if (newValue === '4' || newValue === '5') {
        g_form.showFieldMsg("repeat_every", getMessage("This job will repeat every N months. For example, if repeat every is set to 2, the job will repeat every 2 months"), "info");
        return;
    }

}
