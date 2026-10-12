function onChange(control, oldValue, newValue) {
    if (newValue == 'goto') {
        g_form.setDisplay('rejection_goto', true);
        g_form.setDisplay('rejection_script', false);
    } else if (newValue == 'run_script') {
        g_form.setDisplay('rejection_goto', false);
        g_form.setDisplay('rejection_script', true); 
    } else {
        g_form.setDisplay('rejection_goto', false);
        g_form.setDisplay('rejection_script', false);
    }
}
