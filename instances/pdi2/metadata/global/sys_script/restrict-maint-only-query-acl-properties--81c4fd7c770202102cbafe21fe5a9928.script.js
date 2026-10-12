(function executeRule(current, previous /*null when async*/ ) {

    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage('User not authorized to {0}', current.operation()));

})(current, previous);
