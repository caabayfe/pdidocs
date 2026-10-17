(function executeRule(current, previous /*null when async*/ ) {

    gs.addErrorMessage(gs.getMessage('Invalid insert. This NLU utterance or entity is read only.'));
    current.setAbortAction(true);

})(current, previous);
