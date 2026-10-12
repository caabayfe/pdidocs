(function executeRule(current, previous /*null when async*/ ) {
    // Add your code here
    gs.addErrorMessage(gs.getMessage("Please update through Menu Options."));
    current.setAbortAction(true);
})(current, previous);
