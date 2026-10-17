(function executeRule(current, previous ) {

    if (!current.user || !current.notification)
        return;

    var gr = new GlideRecord('sys_provider_notif_subscription');
    gr.addQuery('user', current.getValue('user'));
    gr.addQuery('notification', current.getValue('notification'));
    gr.query();

    if (gr.next()) {
        gs.addErrorMessage(gs.getMessage('You have already subscribed to this notification'));
        current.setAbortAction(true);
    }

})(current, previous);
