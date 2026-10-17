(function executeRule(current, previous /*null when async*/ ) {
    if ((current.value) < 10 || (current.value > 4096)) {
        gs.addErrorMessage(gs.getMessage("client secret auto generate length should be between 10 and 4096"));
        current.setAbortAction(true);
    }
})(current, previous);
