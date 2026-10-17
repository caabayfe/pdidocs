(function executeRule(current, previous /*null when async*/) {

	var breakdownDefinition = new SLABreakdownDefinition(current);
	g_scratchpad.breakdownTableData = breakdownDefinition.getActiveBreakdownTableData();
	g_scratchpad.breakdownDataExists = breakdownDefinition.breakdownDataExists();
	g_scratchpad.slaEngineVersion = gs.getProperty('com.snc.sla.engine.version', '2010');

})(current, previous);
