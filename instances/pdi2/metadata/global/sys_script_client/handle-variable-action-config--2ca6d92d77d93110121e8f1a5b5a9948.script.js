function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading) {
        if (!g_form.getValue('wizard_question'))
            g_form.setDisplay('variable_config', false);
			
        return;
    }
    g_form.clearValue('variable_config');
    newValue == '' ? g_form.setDisplay('variable_config', false) : g_form.setDisplay('variable_config', true);
}
