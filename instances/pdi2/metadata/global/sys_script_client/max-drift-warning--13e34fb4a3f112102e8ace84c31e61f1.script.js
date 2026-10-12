function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || !g_form.isNewRecord()) {
        return;
    }


    if (newValue === '' && ["once", "on_demand"].indexOf(g_form.getValue("run_type")) == -1) {
        g_form.addFormMessage(getMessage("Recurring Download Schedules should have a max_drift."), "warning");
        return;
    }

    g_form.clearMessages();
}
