(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage('Search Config content block cannot be deleted'));
    current.setAbortAction(true);
})(current, previous);
