(function executeRule(current, previous /*null when async*/) {
	var event = new GlideRecord("sys_sg_event");
	event.addQuery("source_id", current.source_id);
	if (current.operation() == "update")
		event.addQuery("sys_id", "!=", current.sys_id);
		
	event.query();
	if (event.getRowCount() > 0) {
		var errorMsg = gs.getMessage("Another event is already linked to the source. Only a single event can be linked to a source.");
		gs.addErrorMessage(errorMsg);
		current.setAbortAction(true);
	}
})(current, previous);
