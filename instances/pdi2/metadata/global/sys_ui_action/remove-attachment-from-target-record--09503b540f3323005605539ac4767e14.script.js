(function action(current) {
	var attachment = new GlideRecord('sys_attachment');
	attachment.get(current.attachment);
	
	if(!attachment.canWrite())
		return;

	var email = new GlideRecord('sys_email');
	email.get(current.email);
	
	attachment.table_name = email.getTableName();
	attachment.table_sys_id = email.getUniqueValue();
	attachment.update();
	
	current.action = 'discarded';
	current.action_reason = 'Attachment removed from target via ui action';
	current.update();
})(current);
