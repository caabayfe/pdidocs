function onChange(control, oldValue, newValue) {
    var dis = false;
    if (newValue == 'true')
        dis=true;
    g_form.setDisplay('help_tag', dis);
    g_form.setDisplay('help_text', dis);
}
