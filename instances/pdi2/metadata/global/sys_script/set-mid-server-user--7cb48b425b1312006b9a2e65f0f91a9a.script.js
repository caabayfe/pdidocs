(function executeRule(current, previous /*null when async*/) {
	var user = GlideUser.getCurrentUser();
	if (JSUtil.notNil(user))
		current.user_name = user.getName();
})(current, previous);
