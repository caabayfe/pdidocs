(function executeRule(current, previous /*null when async*/ ) {

    if (!current.automated) {
        gs.addErrorMessage(gs.getMessage("Aggregated group can be set only if Automated group is set to true"));
        current.setAbortAction(true);
    }

})(current, previous);
