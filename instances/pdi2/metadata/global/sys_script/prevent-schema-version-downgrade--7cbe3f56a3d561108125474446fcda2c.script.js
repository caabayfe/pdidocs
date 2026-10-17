(function executeRule(current, previous /*null when async*/ ) {
    if (current.schema_version < previous.schema_version) {
        gs.addErrorMessage(gs.getMessage("Cannot downgrade process."));
        current.setAbortAction(true);
    }

})(current, previous);
