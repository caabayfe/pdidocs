(function executeRule(current, previous /*null when async*/ ) {
    var userId = current.getValue('user');
    if (gs.nil(userId)) {
        return;
    }

    var ci = current.getValue('ci');
    var svc = !gs.nil(ci) ? current.ci.getRefRecord() : null;

    if (!svc || !svc.isValidRecord() || !svc.isValidField('service_owner_delegate')) {
        return;
    }

    if (svc.getValue('service_owner_delegate') === userId) {
        svc.setValue('service_owner_delegate', '');
        svc.update();
    }

})(current, previous);
