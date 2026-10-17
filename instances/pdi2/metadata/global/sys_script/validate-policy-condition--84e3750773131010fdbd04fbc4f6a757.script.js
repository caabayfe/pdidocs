(function executeRule(current, previous /*null when async*/) {

	// Validate that the operation will not result in blocking the user session.
	try {
        var isValid = SNC.AuthPolicyIPUtil.validatePolicyConditionChange(current, previous, current.operation());
        if (!isValid) {
            gs.addErrorMessage(gs.getMessage("Current session may get blocked due to this operation. Aborting the operation."));
            current.setAbortAction(true);
        }
    } catch (ex) {
        var message = "Exception while performing operation on the Authentication policy condition.";
        message += ex.message;
        gs.error(message);
    }

})(current, previous);
