(function executeRule(current, previous /*null when async*/) {
	
	if (!previous.last_discovered || previous.last_discovered != current.last_discovered) {
		var networkPathManager = new SNC.NetworkPathManager();
		var dh1 = new SNC.DomainHelper();
		dh1.adjustDomainByCiSysId(current.sys_id);
		networkPathManager.createPhysicalConnections(current.sys_id);
		dh1.restoreCurrentSessionParams();
	}
	
})(current, previous);
