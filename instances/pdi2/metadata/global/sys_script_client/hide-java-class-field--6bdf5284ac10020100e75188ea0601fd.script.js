function onChange(control, oldValue, newValue) {
    if (newValue == 'Java') {
        g_form.setDisplay('java_class', true);
    } else {
        g_form.setDisplay('java_class', false);
    }
}
