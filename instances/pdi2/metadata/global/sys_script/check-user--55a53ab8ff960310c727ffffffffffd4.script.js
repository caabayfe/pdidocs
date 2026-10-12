(function executeRule(current, previous /*null when async*/ ) {
    if (gs.hasRole('provider_notification_subscription_admin'))
        return;

    if (current.getValue('user') != gs.getUserID()) {
        gs.addErrorMessage(gs.getMessage('Invalid insert'));
        current.setAbortAction(true);
    }
})(current, previous);
