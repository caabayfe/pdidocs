(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecordSecure('sys_cs_topic');
	gr.addQuery('name', current.name);
	gr.addQuery('sys_id', '!=', current.getUniqueValue());
	gr.query();
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('A topic with the same name already exists'));
		current.setAbortAction(true);
	}

})(current, previous);
