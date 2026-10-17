(function executeRule(current, previous /*null when async*/) {
	gs.include('EvtMgmtAlertManagementCommons'); 
	var evtMgmtAlertManagementCommons = new EvtMgmtAlertManagementCommons(); 
	if (evtMgmtAlertManagementCommons.activeRemediationExist(current)) {
		gs.addErrorMessage(gs.getMessage("Abort adding action \"{0}\", same remediation workflow can't be added twice.", GlideStringUtil.escapeHTML(current.workflow.name)));
		current.setAbortAction(true);
	}	
	// Add your code here

})(current, previous);
