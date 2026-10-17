(function executeRule(current, previous /*null when async*/) {	
	var msg = gs.getMessage("Invalid alias name. Alias name may only contain A-Z, a-z, 0-9, _, @, ., /, #, &, +, -, =, !, *, (, ), or space");

	if (current.name.match(/[^A-Za-z0-9_ @./()#&+\-=!*]/)){
		gs.addErrorMessage(msg);
		current.setAbortAction(true);
		return false;
	}
	return true;
})(current, previous);
