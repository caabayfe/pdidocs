(function executeRule(current, previous /*null when async*/) {
	var duplicateGr = new GlideRecord('sys_notification_preference');
	duplicateGr.addQuery("recipient_table", current.recipient_table);
	duplicateGr.addQuery("recipient", current.recipient);
	duplicateGr.addQuery("destination_table", current.destination_table);
	duplicateGr.addQuery("destination", current.destination);
	duplicateGr.addQuery("destination_identifier_field", current.destination_identifier_field);
	duplicateGr.addQuery("notification", current.notification);
	if (current.operation() == 'update')
		duplicateGr.addQuery("sys_id", "!=", current.sys_id);
	duplicateGr.query();
	if (duplicateGr.next()) {
	  gs.addInfoMessage(gs.getMessage("This notification preference already exists"));
	  current.setAbortAction(true);
	}
})(current, previous);
