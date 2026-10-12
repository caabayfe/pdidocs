(function executeRule(current, previous /*null when async*/) {
	var prevChgReq = new ChangeRequest(previous);
	// Allow the modification if the Change Request state was previously New, Assess or Authorize.
	if (prevChgReq.isNew() || prevChgReq.isAssess() || prevChgReq.isAuthorize())
		return;
	
	if (current.cab_date.changes())
		gs.addErrorMessage(gs.getMessage("CAB date is read only for Change Requests in {0} state", current.state.getDisplayValue()));

	if (current.cab_date_time.changes())
		gs.addErrorMessage(gs.getMessage("CAB date/time is read only for Change Requests in {0} state", current.state.getDisplayValue()));

	if (current.cab_recommendation.changes())
		gs.addErrorMessage(gs.getMessage("CAB recommendation is read only for Change Requests in {0} state", current.state.getDisplayValue()));
	
	// Abort the modification
	current.setAbortAction(true);
})(current, previous);
