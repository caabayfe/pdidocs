(function executeRule(current, previous /*null when async*/) {
	gs.eventQueue("custom_app.create", current, current.sys_id, current.scope);
})(current, previous);
