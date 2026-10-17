(function executeRule(current, previous /*null when async*/) {
	var eventM2mAction = new GlideRecord("sys_sg_event_m2m_action");
	eventM2mAction.addQuery("event", current.event);
	if (current.operation() == "update")
		eventM2mAction.addQuery("sys_id", "!=", current.sys_id);
		
	eventM2mAction.query();
	if (eventM2mAction.getRowCount() > 0) {
		var errorMsg = gs.getMessage("An Action is already linked to the Event. An Event can have only one Action.");
		gs.addErrorMessage(errorMsg);
		current.setAbortAction(true);
	}
})(current, previous);
