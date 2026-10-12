function onChange(control, oldValue, newValue) { 
    jslog('oldValue = ' + oldValue + ' newValue = ' + newValue); 
    if (newValue == 'true')
        g_form.setVisible('view', false); 
    else 
        g_form.setVisible('view', true); 
}
 
