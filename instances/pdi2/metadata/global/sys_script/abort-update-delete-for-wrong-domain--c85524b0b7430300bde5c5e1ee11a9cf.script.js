(function executeRule(current, previous /*null when async*/) {
	gs.include('EvtMgmtAlertManagementCommons'); 
	var evtMgmtAlertManagementCommons = new EvtMgmtAlertManagementCommons(); 
	if (!(evtMgmtAlertManagementCommons.shouldAllowUpdateOrDeleteToActionByRecordDomain(current))) {
		gs.addErrorMessage(gs.getMessage("Abort updating action, only user from the rule's domain can update action."));
		current.setAbortAction(true);
	}	
	// Add your code here

})(current, previous);
