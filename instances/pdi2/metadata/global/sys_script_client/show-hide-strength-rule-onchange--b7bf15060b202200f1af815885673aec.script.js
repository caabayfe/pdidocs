function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue == '' || g_form.getBooleanValue('enable_password_policy') == true) {
        return;
    }

    g_form.setDisplay('strength_rule', newValue === 'true');
}
