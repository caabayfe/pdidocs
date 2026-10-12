(function executeRule(current, previous /*null when async*/) {

	var errMsg = SystemCloneUtil.validatePreserver(current);
	if(!gs.nil(errMsg)) {
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}

})(current, previous);
