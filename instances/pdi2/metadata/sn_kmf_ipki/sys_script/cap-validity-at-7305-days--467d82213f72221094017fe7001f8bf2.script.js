(function executeRule(current, previous) {

    // The Filter Condition has already determined the validity is out of range.
    // We only need to perform the actions.
    gs.addErrorMessage("Validity duration must be greater than 0 days and cannot exceed 7305 days (20 years).");
    current.setAbortAction(true);

})(current, previous);
