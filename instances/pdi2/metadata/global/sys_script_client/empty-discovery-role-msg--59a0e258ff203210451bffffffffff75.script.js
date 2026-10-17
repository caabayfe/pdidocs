function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        g_form.showFieldMsg("discovery_allowed_roles", getMessage("Channel configuration for discovery cannot be managed unless at least one role is assigned."));
        return;
    }
}
