(function executeRule(current, previous /*null when async*/) {
	if (shouldSkipExecution(current))
		return;

	var gr = new GlideRecord('io_set_item');
	gr.addQuery('variable_set.internal_name', current.variable_set.internal_name);
	gr.addQuery('sc_cat_item', current.sc_cat_item);
	gr.query();
	if (gr.next() && (gr.getUniqueValue() != current.getUniqueValue())) {
		gs.addErrorMessage(gs.getMessage("There are other variable set(s) with the same internal name '{0}' associated with the catalog item", current.variable_set.internal_name));
		current.setAbortAction(true);
	}

	function shouldSkipExecution(current) {
        return shouldSkipByProcess(current);
    }
    function shouldSkipByProcess(current) {
        return JSUtil.has(new global.SNCCatalogUtil().isProcessBuilder) && new global.SNCCatalogUtil().isProcessBuilder(current, ['checkout']);
    }
})(current, previous);
