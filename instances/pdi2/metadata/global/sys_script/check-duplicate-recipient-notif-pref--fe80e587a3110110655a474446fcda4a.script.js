(function executeRule(current, previous /*null when async*/) {
	var duplicateGr = new GlideRecord('sys_recipient_notif_preference');
	duplicateGr.addQuery("recipient_table", current.recipient_table);
	duplicateGr.addQuery("recipient", current.recipient);
	duplicateGr.addQuery("notification_table", current.notification_table);
	duplicateGr.addQuery("notification", current.notification);
	if (current.operation() == 'update')
		duplicateGr.addQuery("sys_id", "!=", current.sys_id);
	duplicateGr.query();
	if (duplicateGr.next()) {
		gs.addErrorMessage(gs.getMessage("This recipient notification preference already exists.This insert operation has failed."));
		current.setAbortAction(true);
	}
})(current, previous);
