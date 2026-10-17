(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('ts_index_group');
	if (gr.get('name', current.name)) {
		gs.addErrorMessage(gs.getMessage('Index group with name {0} already exists', current.name));
		current.setAbortAction(true);
	}
})(current, previous);
