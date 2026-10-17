(function executeRule(current, previous /*null when async*/) {
	if (shouldSkipExecution(current))
		return;

	var catItem = current.sc_cat_item;
	var variableSet = current.variable_set;
	var requestedForUtil = new RequestedForUtil();
	//In case of update operation, if the outgoing variable_set has requested for, 
	//then there is no need to do item check as the outgoing VS had the requested for.
	if(current.operation() == "update" && current.variable_set.changes() && requestedForUtil.hasRequestedForOnVariableSet(previous.variable_set)) {
		return;
	}
	//Check requested for on item and variable set that they both do not have a requested for variable
	if (requestedForUtil.hasRequestedForOnVariableSet(variableSet) && requestedForUtil.hasRequestedForOnItem(catItem)) {
		gs.addErrorMessage(gs.getMessage("You cannot associate {0} with {1} since the item already includes a Requested For variable. {2}", [variableSet.getDisplayValue(), catItem.getDisplayValue(), requestedForUtil.getDocumentationLink()]));
		current.setAbortAction(true);
		return;
	}

	function shouldSkipExecution(current) {
		return shouldSkipByProcess(current) || (!current.isNewRecord() && !(current.sc_cat_item.changes() || current.variable_set.changes()));
	}
	function shouldSkipByProcess(current) {
		return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['checkout','publish']);
	}
})(current, previous);
