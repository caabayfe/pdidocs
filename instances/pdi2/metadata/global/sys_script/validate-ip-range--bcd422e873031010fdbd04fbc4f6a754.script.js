(function executeRule(current, previous /*null when async*/ ) {

    // Validate that the operation will not result in blocking the user session.
    try {
        var isValid = SNC.AuthPolicyIPUtil.validateIPCollectionChange(current, previous, current.operation());
        if (!isValid) {
            gs.addErrorMessage(gs.getMessage("Current session may get blocked by one of the Authentication policies due to this operation. Aborting the operation."));
            current.setAbortAction(true);
        }
    } catch (ex) {
        var message = "Exception while performing operation on the IP Range record.";
        message += ex.message;
        gs.error(message);
    }

})(current, previous);
