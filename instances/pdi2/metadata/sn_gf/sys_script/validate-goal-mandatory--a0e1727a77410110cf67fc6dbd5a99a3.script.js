(function executeRule(current, previous /*null when async*/ ) {
    if (!current.getValue("name")) {
        gs.addErrorMessage(gs.getMessage("Name field is mandatory."));
        current.setAbortAction(true);
    }
})(current, previous);
