(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_notif_dest_type_setting');
	gr.addQuery("notification", current.notification);
	gr.addQuery("destination_type", current.destination_type);
	if (current.operation() == 'update')
		gr.addQuery("sys_id", "!=", current.sys_id);
	gr.query();
	if (gr.next()) {
		gs.addInfoMessage(gs.getMessage("This destination type setting already exists"));
		current.setAbortAction(true);
	}
})(current, previous);
