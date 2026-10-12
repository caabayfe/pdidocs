(function executeRule(current, previous /*null when async*/ ) {
    var previousStatus = previous.status;
    var currentStatus = current.status;
    if (currentStatus == '') {
        gs.addErrorMessage(gs.getMessage("Status cannot be empty for a user. Please select the correct status!"));
        current.setAbortAction(true);
        return;
    }
    if (SNC.MultifactorAuthUtil.isMFAEnforcementStatusChangeAllowed(previousStatus, currentStatus))
        return;

    gs.addErrorMessage(gs.getMessage("Changing the status is only allowed from Tracking to Enforced!"));
    current.setAbortAction(true);

})(current, previous);
