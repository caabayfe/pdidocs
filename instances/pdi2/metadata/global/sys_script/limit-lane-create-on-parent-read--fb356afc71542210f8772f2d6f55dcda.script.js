(function executeRule(current, previous /*null when async*/ ) {
    if (!current.process_definition.canRead()) {
        gs.addErrorMessage(gs.getMessage("User does not have access"));
        current.setAbortAction(true);
    }
})(current, previous);
