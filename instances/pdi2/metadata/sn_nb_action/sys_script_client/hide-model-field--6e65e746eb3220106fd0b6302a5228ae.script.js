function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (g_form.getValue('model_table') != g_form.getValue('table_name'))
        g_form.setDisplay('model_field', true);
    else
        g_form.setDisplay('model_field', false);
}
