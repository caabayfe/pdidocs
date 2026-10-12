(function executeRule(current, previous /*null when async*/) {

	var currentName = current.getValue('name');
	var gr = new GlideRecord('life_cycle_stage_status');
	gr.addQuery('name', currentName);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
	}

})(current, previous);
