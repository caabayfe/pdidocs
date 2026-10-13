(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord(current.getTableName());
	gr.addActiveQuery();
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.addQuery('default_group', false);
	gr.addQuery('manual_selection', false);
	gr.addQuery('order', current.getValue('order'));
	gr.setLimit(1);
	gr.query();
	if (gr.hasNext()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("Order value has to be unique among all records in 'Provider Selector'"));
	}

})(current, previous);
