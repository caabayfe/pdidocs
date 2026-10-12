(function executeRule(current, previous /*null when async*/) {

	var errMsg = SystemCloneUtil.validateExclusion(current);
	if(!gs.nil(errMsg)) {
		gs.addErrorMessage(errMsg);
		current.setAbortAction(true);
	}

})(current, previous);
