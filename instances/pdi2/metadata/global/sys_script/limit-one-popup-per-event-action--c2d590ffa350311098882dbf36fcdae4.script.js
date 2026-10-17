(function executeRule(current, previous /*null when async*/) {
	var eventActionM2mPopup = new GlideRecord("sys_sg_event_action_m2m_popup");
	eventActionM2mPopup.addQuery("event_action", current.event_action);
	if (current.operation() == "update")
		eventActionM2mPopup.addQuery("sys_id", "!=", current.sys_id);
		
	eventActionM2mPopup.query();
	if (eventActionM2mPopup.getRowCount() > 0) {
		var errorMsg = gs.getMessage("A Popup is already linked to the Event Action. An Event Action can have only one Popup.");
		gs.addErrorMessage(errorMsg);
		current.setAbortAction(true);
	}
})(current, previous);
