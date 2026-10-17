(function executeRule(current, previous /*null when async*/) {
	var isSideBarActive = current.value == 'true' && current.operation() != 'delete';
	sn_collab.CollabChatScriptObject.deregisterResponder();
	if (isSideBarActive)
		sn_collab.CollabChatScriptObject.registerResponder();
})(current, previous);
