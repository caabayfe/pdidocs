(function executeRule(current, previous /*null when async*/ ) {

    gs.addErrorMessage(gs.getMessage('You are not allowed to define a traversal rule for Service Recomputation'));
    current.setAbortAction(true);

})(current, previous);
