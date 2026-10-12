(function executeRule(current, previous /*null when async*/) {

	if (current == null)
		return;
	
	DiscoveryGlideListUtils.removeMidFromListInCred(current.getUniqueValue());
	gs.eventQueue("mid.credentials.update", null, "agent", current.getUniqueValue());
})(current, previous);
