function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue) {
        g_form.showFieldMsg('outgoing_sms_subflow', getMessage("Select a subflow that doesn't send an SMS itself and set off a repetitive cycle in the process."), 'info', 'true');
    }
}
