function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }

    if (newValue === 'false')
        g_form.showFieldMsg("active", getMessage("Warning: Inactivating this policy will disable associated policy rules from running"), "warning");
}
