(function executeRule(current, previous) {
    if (current.getValue("secure_connection") != "1") {
        gs.addErrorMessage(gs.getMessage("Secure connection must be enabled when using mTLS authentication"));
        current.setAbortAction(true);
    }
})(current, previous);
