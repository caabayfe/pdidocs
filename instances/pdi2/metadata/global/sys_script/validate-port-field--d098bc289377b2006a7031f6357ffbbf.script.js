(function executeRule(current, previous /*null when async*/) {
	var portStr = current.port;
	if(GlideStringUtil.nil(portStr)) {
		var errorMsg = gs.getMessage("UDP port field cannot be empty");
		gs.addErrorMessage(errorMsg);
		current.setAbortAction(true);
		return;
	}
	
	var port = parseInt(portStr);
	if(port < 1 || port > 65535) {
		var portErrorMsg = gs.getMessage("UDP port field must be in the range of 1-65535");
		gs.addErrorMessage(portErrorMsg);
		current.setAbortAction(true);
	}
	
})(current, previous);
