(function executeRule(current, _previous /*null when async*/) {
	var gr = new GlideRecord('sys_notif_subscription');
	gr.addQuery("user", current.user);
	gr.addQuery("notification", current.notification);
	gr.addQuery("affected_table", current.affected_table)
	gr.addQuery("affected_record", current.affected_record);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		
		if (current.affected_record) {
			gs.addInfoMessage(gs.getMessage("You have already subscribed to this notification for the affected record"));
		} else {
			gs.addInfoMessage(gs.getMessage("You have already subscribed to this notification"));
		}
	}
})(current, previous);
