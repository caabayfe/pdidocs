(function executeRule(current, previous /*null when async*/) {
    if (shouldSkipExecution(current))
    	return;

	var catItem = current.cat_item;
	var variableSet = current.variable_set;
	var requestedForUtil = new RequestedForUtil();

	if (catItem && requestedForUtil.hasRequestedForOnItem(catItem)) {
		gs.addErrorMessage(gs.getMessage("Catalog Item cannot include multiple Requested For variables. {0}", requestedForUtil.getDocumentationLink()));
		current.setAbortAction(true);
		return;
	}
	
	if (variableSet) {
		var globalServiceCatalogUtil = new GlobalServiceCatalogUtil();
		if (globalServiceCatalogUtil.isMultiRowVariableSet(variableSet)) {
			gs.addErrorMessage(gs.getMessage("Multi-row variable set cannot include a Requested For variable. {0}", requestedForUtil.getDocumentationLink()));
			current.setAbortAction(true);
			return;
		}

		if (requestedForUtil.hasRequestedForOnVariableSet(variableSet)) {
			gs.addErrorMessage(gs.getMessage("Variable Set cannot include multiple Requested For variables. {0}", requestedForUtil.getDocumentationLink()));
			current.setAbortAction(true);
			return;
		}
		//Check on items attached to variable set
		var gr = new GlideRecord("io_set_item");
		gr.addQuery("variable_set", variableSet);
		gr.query();
		while(gr.next()) {
			if (requestedForUtil.hasRequestedForOnItem(gr.sc_cat_item)) {
				gs.addErrorMessage(gs.getMessage("Requested For variable is already defined on catalog item(s) associated with this variable set. {0}", requestedForUtil.getDocumentationLink()));
				current.setAbortAction(true);
				return;
			}
		}
	}
	
	function shouldSkipExecution(current) {
		return current.type != '31' || shouldSkipByProcess(current) || (!current.isNewRecord() && !((current.cat_item.changes() || current.variable_set.changes() || current.type.changes())));
	}
	
	function shouldSkipByProcess(current) {
		return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['publish']);
	}

})(current, previous);
