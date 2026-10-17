(function executeRule(current, previous /*null when async*/ ) {
    if (!current.isNewRecord())
        gs.addInfoMessage(gs.getMessage("Note: Each Project Definition can be associated with one Scheduled Job only."));
})(current, previous);
