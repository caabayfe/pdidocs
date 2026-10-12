(function executeRule(current, previous /*null when async*/) {
    var result;
	try {
        result = SNC.AuthPolicyIPUtil.validatePolicyActivationForIDPAttributes(current, previous);
        if (result) {
			gs.addErrorMessage(gs.getMessage(result));
			current.setAbortAction(true);
        }
    } catch (ex) {
        var errorMsg = "Error while activating this policy: " + ex.message;
        gs.error(errorMsg);
        current.setAbortAction(true);
        gs.addErrorMessage(errorMsg);
	}
})(current, previous);
