function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue == 'true') {
        g_form.setDisplay('macroponent', true);
        g_form.setDisplay('content', false);
    } else {
        g_form.setDisplay('macroponent', false);
        g_form.setDisplay('content', true);
    }

}
