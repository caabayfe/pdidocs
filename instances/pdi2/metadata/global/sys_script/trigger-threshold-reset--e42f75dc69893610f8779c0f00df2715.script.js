(function executeRule(current, previous /*null when async*/) {

	new GlideEventManager().queue("com.snc.pa.dm.reset_threshold", "", current.sys_id, "kpi_change_event");
	gs.info("com.snc.pa.dm.reset_threshold event invoked for KPI change");

})(current, previous);
