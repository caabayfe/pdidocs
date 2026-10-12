function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        return;
    var advanced = g_form.getValue("advanced");
    if (advanced != "true") {
        g_form.setValue("run_start", "");
        g_form.setValue("entered_run_start", "");
        g_form.setValue("run_end", "");
        g_form.setValue("entered_run_end", "");
        g_form.setValue("repeat_every", "");
    }
}
