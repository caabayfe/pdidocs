function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '')
        g_form.setDisplay('offerings_per_service', oldValue);

    if (newValue == 'false')
        g_form.setDisplay('offerings_per_service', false);
    else
        g_form.setDisplay('offerings_per_service', true);
}
