(function executeRule(current, previous /*null when async*/) {

	var alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphanumericRegex.test(current.name)) {
        var msg = gs.getMessage('Security Attribute name can only have alphanumeric characters and underscores (_) - {0}', current.name);
        gs.addErrorMessage(msg);
        current.setAbortAction(true);
    }

})(current, previous);
