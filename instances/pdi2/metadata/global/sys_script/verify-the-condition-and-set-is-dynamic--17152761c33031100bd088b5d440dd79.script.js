(function executeRule(current, previous /*null when async*/ ) {
    // first, validate the condition and abort action if it's invalid, for example, 'null' string
    var regex = /^[A-Za-z0-9._]+$/;
    if (current.condition != null && regex.test(current.condition)) {
        var msg = gs.getMessage('Invalid Condition value: {0}', current.condition);
        gs.addErrorMessage(msg);
        current.setAbortAction(true);
        return;
    }

    var api = new SNC.SecurityAttributeAPI();
    current.is_dynamic = api.securityAttributeIsDynamic(current.condition);

})(current, previous);
