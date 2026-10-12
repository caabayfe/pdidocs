(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_cb_topic_category');
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.addQuery('name', current.getValue('name'));
	gr.query();
	if (gr.next()) {
		var error = gs.getMessage('Category cannot be added twice.');
		gs.addErrorMessage(error);
		current.setAbortAction(true);
	}
})(current, previous);
