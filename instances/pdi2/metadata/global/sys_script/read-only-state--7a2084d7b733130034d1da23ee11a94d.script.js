(function executeRule(current, previous /*null when async*/) {
	var prevChgReq = new ChangeRequest(previous);
	// Allow the modification of the Change Request if was previously not on hold.
	if (!prevChgReq.isOnHold())
		return;
	
	var currChgReq = new ChangeRequest(current);
	if (currChgReq.isOnHold())
		gs.addErrorMessage(gs.getMessage("State is read only for on hold Change Requests"));
	
	// Abort the modification
	current.setAbortAction(true);
})(current, previous);
