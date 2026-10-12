(function executeRule(current, previous /*null when async*/) {
	var previousLastMessage = new GlideRecord("live_message");
	previousLastMessage.addQuery("sys_created_on", "<=", current.sys_created_on);
	previousLastMessage.addQuery("last_message", "true");
	previousLastMessage.addQuery("group", current.group);
	previousLastMessage.query();
	
	while(previousLastMessage.next()) {
		previousLastMessage.last_message = false;
		previousLastMessage.update();
	}
})(current, previous);
