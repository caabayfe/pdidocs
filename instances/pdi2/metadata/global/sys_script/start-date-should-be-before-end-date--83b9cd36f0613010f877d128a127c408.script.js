(function executeRule(current, previous /*null when async*/) {
    var startDate = current.starts;
    var endDate = current.ends;
    var startDateGDT = startDate.getGlideObject();
    var endDateGDT = endDate.getGlideObject();
    if (startDateGDT.after(endDateGDT)) {
        gs.addErrorMessage(gs.getMessage("Start date should be before end date"));
        current.setAbortAction(true);
    }
})(current, previous);
