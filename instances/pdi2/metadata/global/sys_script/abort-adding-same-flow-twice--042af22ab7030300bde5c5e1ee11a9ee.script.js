(function executeRule(current, previous /*null when async*/) {
	gs.include('EvtMgmtAlertManagementCommons'); 
	var evtMgmtAlertManagementCommons = new EvtMgmtAlertManagementCommons(); 
	if (evtMgmtAlertManagementCommons.activeFlowExist(current)) {
		gs.addErrorMessage(gs.getMessage("Abort adding action '{0}', same subflow can't be added twice.", current.sub_flow.name));
		current.setAbortAction(true);
	}	
	// Add your code here

})(current, previous);
