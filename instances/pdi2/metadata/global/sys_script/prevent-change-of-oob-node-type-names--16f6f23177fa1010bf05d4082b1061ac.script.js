(function executeRule(current, previous /*null when async*/) {
	var prevName = previous.getValue("name");
	var curName = current.getValue("name");
	var defaultNodeTypes = new VNCCNodeUtil().getDefaultNodeTypes();
	if (defaultNodeTypes.indexOf(prevName) > -1 && curName != prevName) {
		gs.addErrorMessage(gs.getMessage("Cannot change names of default node types"));
		current.setAbortAction(true);
	}
	
})(current, previous);
