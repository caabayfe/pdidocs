function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading)
        return;

    g_form.hideAllFieldMsgs();
    g_form.clearValue('from_field');
    g_form.clearValue('run_after_binding');
}
