function onSubmit() {
    var priority = g_form.getValue('priority'); 
    if (priority == 1)
        return confirm(getMessage('Submit a priority one ticket?'));
}
 
