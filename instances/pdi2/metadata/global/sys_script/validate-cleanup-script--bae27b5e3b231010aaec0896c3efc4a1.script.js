(function executeRule(current, previous /*null when async*/) {

	if(!SystemCloneUtil.validateCleanupScript(current)) {
		gs.addErrorMessage(CloneConstants.errorMsg.CLEANUP_SCRIPT_EXISTS);
		current.setAbortAction(true);
	}

})(current, previous);
