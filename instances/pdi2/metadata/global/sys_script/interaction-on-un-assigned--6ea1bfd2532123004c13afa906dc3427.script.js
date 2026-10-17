(function executeRule(current, previous /*null when async*/) {
		var chatLogger = new global.ChatLogger("", current.sys_id);

		chatLogger.log("Interaction - On Un-assigned: assigned_to field was set to empty");
})(current, previous);
