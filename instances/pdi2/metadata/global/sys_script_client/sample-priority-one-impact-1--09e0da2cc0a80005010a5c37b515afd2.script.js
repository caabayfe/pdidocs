function onSubmit() {
    var priority = g_form.getValue('priority');
    var impact = g_form.getValue('impact');
    if (priority == 1 && impact > 2) {
        alert(getMessage('Cannot open a priority 1 incident on a low impact event'));
        return false;
    }
}
 
