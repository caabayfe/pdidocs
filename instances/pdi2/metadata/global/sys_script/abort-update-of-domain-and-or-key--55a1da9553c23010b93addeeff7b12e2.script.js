(function executeRule(current, previous) {
    gs.addErrorMessage(gs.getMessage("Updating domain and/or authentication key is forbidden."));
    current.setAbortAction(true);
})(current, previous);
