(function executeRule(current, previous) {

    var gr = new GlideRecord('sys_notification');
    if (!gr.get(current.getValue('notification'))) {
        gs.addErrorMessage(gs.getMessage('Notification Record does not exist'));
        current.setAbortAction(true);
        return;
    }

    if (gr.getValue('active') != '1' || gr.getValue('subscribable') != '1') {
        gs.addErrorMessage(gs.getMessage('Subscription record cannot be created or updated for inactive or Non-Subscribable Notification'));
        current.setAbortAction(true);
    }

})(current, previous);
