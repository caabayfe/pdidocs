(function executeRule(current, previous /*null when async*/) {
	
	var defaultNodeTypes = new VNCCNodeUtil().getDefaultNodeTypes();
	var nodeTypeOOB = defaultNodeTypes.indexOf(current.getValue("name")) > -1;
	
	var inUseNodeTypes = new VNCCNodeUtil().getInUseNodeTypes();
	var nodeTypeInUse = inUseNodeTypes.indexOf(current.getUniqueValue()) > -1;
	
	if (nodeTypeOOB) {
		gs.addErrorMessage(gs.getMessage("Cannot delete default node types"));
		current.setAbortAction(true);
	}
	
	if (nodeTypeInUse) {
		gs.addErrorMessage(gs.getMessage("Cannot delete in use node types"));
		current.setAbortAction(true);
	}


})(current, previous);
