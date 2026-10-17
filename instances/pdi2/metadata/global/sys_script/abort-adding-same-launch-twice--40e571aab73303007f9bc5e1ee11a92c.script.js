(function executeRule(current, previous /*null when async*/) {
	gs.include('EvtMgmtAlertManagementCommons'); 
	var evtMgmtAlertManagementCommons = new EvtMgmtAlertManagementCommons(); 
	if (evtMgmtAlertManagementCommons.activeLaunchApplicationExist(current)) {
		gs.addErrorMessage(gs.getMessage("Abort adding action \"{0}\", with URL \"{1}\". Same Launch Application display name or URL can't be added twice.", [current.display_name, current.url]));
		current.setAbortAction(true);
	}	

})(current, previous);
