function onBefore(current, previous) {
	if(current.notify_users_after_date.changes()) {
		current.run_start = current.notify_users_after_date;
		var now = new GlideDateTime();
		if(now > current.notify_users_after_date) {
			now.addSeconds(5);
			current.run_start = now;
		}
	}
}
