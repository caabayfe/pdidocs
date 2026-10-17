(function executeRule(current, previous /*null when async*/) {
	// Validate that activating the Auth Policy will not result in blocking the user session.
    try {
        var isValid = SNC.AuthPolicyIPUtil.validatePreAuthPolicyActivation(current, previous);
        if (!isValid) {
            gs.addErrorMessage(gs.getMessage("This Authentication policy is attached to the Pre Authentication Context, Current session may get blocked by Activating this policy. Aborting the operation."));
            current.setAbortAction(true);
        }
    } catch (ex) {
        message = "Exception while Activating this policy.";
        message += ex.message;
        gs.error(message);
    }
})(current, previous);
