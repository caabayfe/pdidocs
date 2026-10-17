(function executeRule(current, previous /*null when async*/ ) {
    var srcId = current.getValue('document');
    if (srcId) {
        var gr = new GlideRecordSecure('incident_alert');
        if (gr.get(srcId) && !gr.getValue('table')) {
            current.setValue('table', 'incident_alert');
        }
        if (current.getValue('group')) {
            current.setValue('type', 'sys_user_group');
        }
        if (current.getValue('recipient_list')) {
            current.setValue('type', 'sn_publications_recipients_list');
        }
    }
})(current, previous);
