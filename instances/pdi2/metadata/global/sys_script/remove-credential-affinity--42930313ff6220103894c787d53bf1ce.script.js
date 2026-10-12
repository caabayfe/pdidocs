(function executeRule(current, previous /*null when async*/) {
	gs.eventQueue("mid.credentials.update", null, "credential_id", current.getUniqueValue());
})(current, previous);
