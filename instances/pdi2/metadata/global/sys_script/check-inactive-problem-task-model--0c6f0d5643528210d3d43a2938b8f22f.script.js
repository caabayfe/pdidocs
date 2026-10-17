(function executeRule(current, previous /*null when async*/ ) {

    gs.addErrorMessage(gs.getMessage('The problem task model is inactive and cannot be used'));
    current.setAbortAction(true);

})(current, previous);
