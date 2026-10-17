function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        g_form.showFieldMsg('allowed_roles', getMessage("Channel configuration for anonymization cannot be managed unless at least one role is assigned."));
        return;
    }
}
