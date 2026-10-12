(function executeRule(current, previous /*null when async*/ ) {
    gs.addErrorMessage(gs.getMessage('Please refrain from deleting the filter attribute, it is required for the filter condition to work and is synced with the Indexed Source form condition builder automatically.'));
    current.setAbortAction(true);

})(current, previous);
