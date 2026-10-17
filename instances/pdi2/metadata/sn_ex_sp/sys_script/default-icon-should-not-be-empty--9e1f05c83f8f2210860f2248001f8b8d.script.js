(function executeRule(current, previous /*null when async*/ ) {

    current.setAbortAction(true);
    gs.addErrorMessage(gs.getMessage("Default icon cannot be a blank"));

})(current, previous);
