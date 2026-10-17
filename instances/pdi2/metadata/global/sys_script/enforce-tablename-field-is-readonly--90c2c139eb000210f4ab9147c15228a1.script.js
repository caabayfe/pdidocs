(function executeRule(current, previous /*null when async*/ ) {
    if (current.tablename != previous.tablename) {
        gs.addErrorMessage(gs.getMessage("Invalid update, tablename field is immutable"));
        current.setAbortAction(true);
    }
})(current, previous);
