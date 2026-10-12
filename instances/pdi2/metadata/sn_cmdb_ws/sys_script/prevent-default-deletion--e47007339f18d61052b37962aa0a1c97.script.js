(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage("Cannot delete default configuration"));
    current.setAbortAction(true);
})(current, previous);
