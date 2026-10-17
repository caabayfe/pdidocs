function onChange(control, oldValue, newValue) {
    if (newValue == 'default') {
        g_form.setDisplay('run_by', false);
    } else {
        g_form.setDisplay('run_by', true);
    }
}
