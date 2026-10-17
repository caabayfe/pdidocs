(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sys_blocked_email_address_log');
    gr.initialize();
    gr.setValue('blocked_email', current.sys_id);
    gr.setValue('more_information', 'State changed from "' + previous.state + '" to "' + current.state + '" by ' + gs.getUserName());
    gr.insert();

    try {
        recordGCFEvents();
    } catch (e) {
        gs.error('Unable to record gcf event for manual change of bounce email address status');
    }

    function recordGCFEvents() {
        if (gs.getUserName() == 'system') return;

        var sm = new GCFSampleMap();
        sm.put('dummy_key', "0");

        if (current.state == 'blocked') {
            GCFCollector.recordUsageEvent('notifications', 'email_bounce_management',
                'email_bounce_email_ids_manual_blocked', sm);
        }

        if (current.state == 'unblocked') {
            GCFCollector.recordUsageEvent('notifications', 'email_bounce_management',
                'email_bounce_email_ids_manual_unblocked', sm);
        }
    }
})(current, previous);
