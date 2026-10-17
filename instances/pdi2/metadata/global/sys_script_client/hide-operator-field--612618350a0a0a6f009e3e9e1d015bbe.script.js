function onChange(control, oldValue, newValue) {
    if (newValue == 'Property File Content') {
        g_form.setDisplay('operator', true);
    } else {
        g_form.setDisplay('operator', false);
    }
}
