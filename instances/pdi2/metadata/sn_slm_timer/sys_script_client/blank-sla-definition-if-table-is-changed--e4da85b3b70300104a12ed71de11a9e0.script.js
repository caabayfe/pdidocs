function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || oldValue === newValue) {
        return;
    }

    // Empty SLA Definition field
    g_form.setValue('sla', '');
}
