(function executeRule(current, previous /*null when async*/) {

	var processConfigUtil = new ProminProcessConfigUtil();
	if(processConfigUtil.isControlFlowCategoryDuplicate(current.getValue("process_def"), current.getValue("category"))) {
		var categoryDisplay = current.getDisplayValue("category");
		gs.addErrorMessage(gs.getMessage("Value mapping for Category '{0}' is already saved for this process configuration", [categoryDisplay]));
        current.setAbortAction(true);
		action.setRedirectURL(current);
	}

})(current, previous);
