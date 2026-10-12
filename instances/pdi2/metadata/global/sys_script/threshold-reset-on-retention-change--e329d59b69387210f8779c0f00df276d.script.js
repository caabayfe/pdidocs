(function executeRule(current, previous /*null when async*/) {

	new GlideEventManager().queue("com.snc.pa.dm.reset_threshold", "", current.id, "retention_change_event");
	gs.info("com.snc.pa.dm.reset_threshold event invoked for retention change");

})(current, previous);
