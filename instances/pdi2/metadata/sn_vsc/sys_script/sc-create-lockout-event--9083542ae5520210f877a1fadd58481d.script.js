(function executeRule(current, previous /*null when async*/ ) {
	var gr = new GlideRecord('sn_vsc_lockout_event');
	gr.initialize();
	gr.setValue('lockout_time', gs.getProperty("glide.user.unlock_timeout_in_mins", 15));
	gr.setValue('lockout_limit', gs.getProperty("glide.user.max_unlock_attempts", 5));
	gr.setValue('failed_logins', current.failed_attempts);
	gr.setValue('user', current.sys_id);
	gr.setValue('user_name', current.user_name);
	gr.insert();
})(current, previous);
