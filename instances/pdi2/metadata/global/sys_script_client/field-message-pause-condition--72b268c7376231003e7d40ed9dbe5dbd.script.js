function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    g_form.hideFieldMsg("pause_condition");
    if (newValue)
        g_form.showFieldMsg("pause_condition", getMessage("Pause conditions can only be used when Duration type is 'User specified duration'"), "info");
}
