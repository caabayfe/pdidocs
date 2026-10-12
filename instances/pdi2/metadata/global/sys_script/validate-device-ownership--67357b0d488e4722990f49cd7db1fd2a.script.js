(function executeRule(current, previous /*null when async*/) {
    if (current.device.nil() || current.user.nil())
        return;

    var device = new GlideRecord('cmn_notif_device');
    if (!device.get(current.device.toString()))
        return;

    if (device.getValue('user') != current.getValue('user')) {
        current.setAbortAction(true);
        gs.addErrorMessage(gs.getMessage('Notification preference device must belong to the specified user'));
    }
})(current, previous);
