function onChange(control, oldValue, newValue) {
    if (newValue == 'variable') {
        g_form.setDisplay('variable', true);
        g_form.setDisplay('value', false);
    } else {
        g_form.setDisplay('variable', false);
        g_form.setDisplay('value', true);
    }
}
