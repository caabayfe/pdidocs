function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (isLoading || newValue === '') {
        return;
    }
    var notif = new GlideRecord("sysevent_email_action");
    notif.addQuery("sys_id", g_form.getValue("notification"));
    notif.query(function() {
        if (notif.next()) {
            var value = notif.affected_field_on_event;
            if (value == 'parm1' || value == 'parm2') {
                g_form.setMandatory('affected_record', true);
                g_form.setDisplay('affected_record', true);
            } else {
                g_form.setMandatory('affected_record', false);
                g_form.setDisplay('affected_record', false);
            }
        }
    });
}
