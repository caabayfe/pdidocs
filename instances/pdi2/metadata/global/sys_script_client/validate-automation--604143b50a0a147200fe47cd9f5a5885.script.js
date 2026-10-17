function onSubmit() {
    var action = g_form.getValue('action');
    if (action == 'send_report')
        return validateReport();
}

function validateReport() {
    var report = g_form.getValue('report');
    if (report == '') {
        var control = g_form.getControl('report');
        g_form.flash(control.id, '#FFFACD',0);
        alert(getMessage('Please specify a report to send.'));
        return false;
    } else
        return true;
}
