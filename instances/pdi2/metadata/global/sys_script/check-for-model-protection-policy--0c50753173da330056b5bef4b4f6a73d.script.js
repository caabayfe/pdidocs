(function executeRule(current, previous /*null when async*/ ) {

    gs.addErrorMessage(gs.getMessage('Invalid insert. This NLU model is read only.'));
    current.setAbortAction(true);

})(current, previous);
