(function executeRule(current, previous /*null when async*/) {
	var selectorGr = new GlideRecord("notify_group_selector");
	selectorGr.addActiveQuery();
	selectorGr.addQuery('default_group', true);
	selectorGr.query();
	if (selectorGr.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Only one active provider selector can be configured as Catch-all"));
	}

})(current, previous);
