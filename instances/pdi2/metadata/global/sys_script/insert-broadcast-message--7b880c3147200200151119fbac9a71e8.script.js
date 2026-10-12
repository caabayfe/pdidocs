function onBefore(current, previous) {
	current.name = "Megaphone Broadcast Message";
	current.script = 'var mega = new MegaphoneBroadcast(current.sys_id).broadcastMessage();';
	current.run_type = "once";
	current.email_sent = "false";
	current.run_start = current.notify_users_after_date;
	var now = new GlideDateTime();
	if(now > current.notify_users_after_date) {
		now.addSeconds(5);
		current.run_start = now;
	}
}
