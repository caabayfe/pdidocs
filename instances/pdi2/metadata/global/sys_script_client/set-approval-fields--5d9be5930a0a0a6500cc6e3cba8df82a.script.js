function onChange(control, oldValue, newValue) {
    if (newValue == 'goto') {
        g_form.setDisplay('approval_goto', true);
        g_form.setDisplay('approval_script', false);
    } else if (newValue == 'run_script') {
        g_form.setDisplay('approval_goto', false);
        g_form.setDisplay('approval_script', true); 
    } else {
        g_form.setDisplay('approval_goto', false);
        g_form.setDisplay('approval_script', false);
    }
}
