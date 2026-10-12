(function executeRule(current, previous /*null when async*/) {

	var errorMsg = gs.getMessage('Trusted Instance not updated because MIFv2 is not fully configured');
	gs.addErrorMessage(errorMsg);
	gs.error(errorMsg);
	current.setAbortAction(true);

})(current, previous);
