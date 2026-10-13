function onCondition() {
    // if the record is Monitor all event management  jobs 
    // no needed thresholds and severity it's a specific job
    if (NOW.sysId == 'fc991b6cb7124010c9a22fb9ee11a9c2') {
        g_form.setVisible('severity', false);
        g_form.setVisible('boolean_value', false);
        g_form.setVisible('threshold_critical', false);
        g_form.setVisible('threshold_major', false);
        g_form.setVisible('threshold_minor', false);
        g_form.setVisible('threshold_warning', false);
    } else {
        g_form.setVisible('severity', false);
        g_form.setVisible('threshold_critical', true);
        g_form.setVisible('threshold_major', true);
        g_form.setVisible('threshold_minor', true);
        g_form.setVisible('threshold_warning', true);
    }
}
