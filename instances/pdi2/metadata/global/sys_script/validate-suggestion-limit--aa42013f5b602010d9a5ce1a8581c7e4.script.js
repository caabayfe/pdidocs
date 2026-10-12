(function executeRule(current, previous /*null when async*/ ) {
    if (current.getValue('limit') < 0) {
        gs.addErrorMessage(gs.getMessage('Suggestion Limit cannot be negative'));
        current.setAbortAction(true);
    }
})(current, previous);
