(function executeRule(current, previous /*null when async*/ ) {
    var prevUser = previous ? previous.getValue('user') : '';
    var newUser = current.getValue('user');
    if (newUser === prevUser) {
        return;
    }

    var ci = current.getValue('ci');
    if (gs.nil(ci)) {
        return;
    }

    var svc = current.ci.getRefRecord();
    if (!svc || !svc.isValidRecord() || !svc.isValidField('service_owner_delegate')) {
        return;
    }

    var fieldUser = svc.getValue('service_owner_delegate');
    if (fieldUser !== prevUser) {
        return;
    }

    svc.setValue('service_owner_delegate', newUser);
    svc.update();
})(current, previous);
