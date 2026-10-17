(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var currentDate = new GlideDate().getDisplayValueInternal();
    var plannedDispositionDate = new GlideDate();
    plannedDispositionDate.setValue(current.getDisplayValueInternal("planned_disposition_date"));
    if (current.isValidField("planned_disposition_date")) {
        if (plannedDispositionDate >= currentDate) {
            return true;
        } else {
            gs.addErrorMessage(gs.getMessage("The Planned disposition date must be the current date or a future date."));
            current.setAbortAction(true);
        }
    }

})(current, previous);
