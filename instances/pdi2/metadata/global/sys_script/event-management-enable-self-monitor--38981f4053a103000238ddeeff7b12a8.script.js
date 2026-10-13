(function executeRule(current, previous /*null when async*/) {
	
	new EvtMgmtHealthMapBuilder().createService();
	new EvtMgmtHealthHandleMonitors().handleMonitors("insert");

})(current, previous);
