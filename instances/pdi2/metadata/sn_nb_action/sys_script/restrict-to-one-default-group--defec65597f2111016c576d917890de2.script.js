(function executeRule(current, previous /*null when async*/) {
	var contextSysId = current.getValue("context");
	var currentGroupSysId = current.getUniqueValue();
	var count = NextBestActionUtil.getCountOfDefaultGroupPerContext(contextSysId, currentGroupSysId);
	if(count >= 1){
		current.setAbortAction(true);
		var message = gs.getMessage("A default recommendation group already exists for this context. There can only be one default group for a context.");
		gs.addErrorMessage(message);
	}

})(current, previous);
