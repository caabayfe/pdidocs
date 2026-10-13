(function executeRule(current, previous /*null when async*/) {
	var evtMgmtHealthMonitorCommon = new EvtMgmtHealthMonitorCommon();
	
	if (!evtMgmtHealthMonitorCommon.allowHealthToRun())
		return;
		
	if (evtMgmtHealthMonitorCommon.isDomainSepActive())
		return;
	
	// new property added to enable fallback to the old code
	if (gs.getProperty("evt_mgmt.health_monitoring_deletion_updated", true) == "true") {
		// once deleted the 'current' is not relevant anymore, and if sent forward it may cause problems	
		if (current.operation() == "delete") {
			gs.eventQueue("evt_mgmt.update_self_health", null, gs.getUserID(), "delete");
		}
		if ((current.operation() == "insert" && current.validated) || 
		current.validated != previous.validated) {
			gs.eventQueue("evt_mgmt.update_self_health", current, gs.getUserID(), current.operation());
		}
	}
	else {
	if (current.operation() == "delete" || (current.operation() == "insert" && current.validated) || 
		current.validated != previous.validated){
		gs.eventQueue("evt_mgmt.update_self_health", current, gs.getUserID(), current.operation());
	}
	}
	
})(current, previous);
