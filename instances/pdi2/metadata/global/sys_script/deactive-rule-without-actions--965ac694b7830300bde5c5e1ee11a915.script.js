(function executeRule(current, previous /*null when async*/) {

	gs.include('EvtMgmtAlertManagementCommons'); 
	var evtMgmtAlertManagementCommons = new EvtMgmtAlertManagementCommons(); 
	if (!(evtMgmtAlertManagementCommons.activeActionsExist(current.getUniqueValue()))) {
		current.active = false;
		current.error_msg = "No active actions";
	}	
})(current, previous);
