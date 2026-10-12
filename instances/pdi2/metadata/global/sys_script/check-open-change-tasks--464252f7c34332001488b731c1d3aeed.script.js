(function executeRule(current, previous /*null when async*/) {

	var chgScript = new ChangeRequest(current);
	
	if (chgScript.hasOpenTasks()) {
		gs.addInfoMessage(gs.getMessage('Unable to close the Change request as there are open Change tasks'));
		current.setAbortAction(true);
	}
})(current, previous);
