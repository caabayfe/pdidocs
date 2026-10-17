(function executeRule(current, previous /*null when async*/) {
	var res = new PADiagnosticsUtil().isScriptAllowed(current.script);
	if(!res){
		gs.addErrorMessage(gs.getMessage('Unable to insert or update the diagnostic as the script modifies records'));
		current.setAbortAction(true);
	}
})(current, previous);
