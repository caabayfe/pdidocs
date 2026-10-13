(function executeRule(current, previous /*null when async*/) {
	current.last_active_on = new GlideDateTime();
})(current, previous);
