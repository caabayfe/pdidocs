(function executeRule(current, previous /*null when async*/ ) {

    gs.addErrorMessage(gs.getMessage('A recommendation can’t have both an input generator and a resource generator. Remove one.'));
    current.setAbortAction(true);

})(current, previous);
