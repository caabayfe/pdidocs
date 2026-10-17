(function executeRule(current, previous /*null when async*/) {

	if (gs.getProperty("glide.db.trim_login_username", 'true') == 'true')
		current.user_name = trim(current.user_name);

})(current, previous);
