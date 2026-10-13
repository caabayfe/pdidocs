function onChange(control, oldValue, newValue) {
    if (newValue == 'XML' || newValue == 'Javascript') {
        g_form.setDisplay('script', true);
    } else {
        g_form.setDisplay('script', false);
    }
}
