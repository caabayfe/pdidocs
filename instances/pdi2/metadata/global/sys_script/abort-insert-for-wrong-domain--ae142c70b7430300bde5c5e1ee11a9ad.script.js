(function executeRule(current, previous /*null when async*/) {
	gs.include('EvtMgmtAlertManagementCommons'); 
	var evtMgmtAlertManagementCommons = new EvtMgmtAlertManagementCommons(); 
	if (!(evtMgmtAlertManagementCommons.shouldAllowInsertActionToTheRuleByDomain(current.management_rule))) {
		gs.addErrorMessage(gs.getMessage("Abort adding action, only user from the rule's domain can insert new action."));
		current.setAbortAction(true);
	}	
	// Add your code here

})(current, previous);
