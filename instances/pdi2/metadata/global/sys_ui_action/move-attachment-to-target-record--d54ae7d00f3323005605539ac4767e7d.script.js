(function action(current) {
	var attachment = new GlideRecord('sys_attachment');
	attachment.get(current.attachment);

	if(!attachment.canWrite())
		return;

	var email = new GlideRecord('sys_email');
	email.get(current.email);
	
	attachment.table_name = email.target_table;
	attachment.table_sys_id = email.instance;
	attachment.update();
	
	current.action = 'attached_to_target_record';
	current.action_reason = 'Attachment moved to target via ui action';
	current.update();
})(current);
