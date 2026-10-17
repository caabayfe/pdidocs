(function executeRule(current, previous /*null when async*/) {
	if (false === SNC.MidServerUtil.isValidStatus(current.status)) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("'{0}' is not a valid MID Server status", [current.status]));
	}
})(current, previous);
