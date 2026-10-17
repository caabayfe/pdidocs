function onChange(control, oldValue, newValue) {
    if (oldValue == 'true' && newValue != 'true') {
        jslog('setting');
        var control = g_form.getControl('knowledge');
        jslog('CONTROL TYPE = ' + control.type);
        g_form.setValue('knowledge', 'true');
    }			
}
