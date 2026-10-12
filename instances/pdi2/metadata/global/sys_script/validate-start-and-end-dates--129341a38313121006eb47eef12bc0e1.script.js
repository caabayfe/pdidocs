(function executeRule(current, previous /*null when async*/) {
    // Convert to GlideDateTime for comparison
    var startDateGDT = current.run_start.getGlideObject();
    var endDateGDT = current.run_end.getGlideObject();

    // The Starting date cannot be the same as or after the Ending date
    if (startDateGDT.onOrAfter(endDateGDT)) {
        gs.addErrorMessage(gs.getMessage("The Starting date cannot be the same as or after the Ending date"));
        current.setAbortAction(true);
    }
})(current, previous);
