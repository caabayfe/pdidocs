(function executeRule(current, previous /*null when async*/) {

	var stage = current.getValue('life_cycle_stage');
	var status = current.getValue('life_cycle_stage_status');
	var table = current.getValue('table');
	var self_id = current.getUniqueValue();
	var gr = new GlideRecord('life_cycle_control');
	gr.addQuery('life_cycle_stage', stage);
	gr.addQuery('life_cycle_stage_status', status);
	gr.addQuery('table', table);
	gr.query();
	if (gr.next() && gr.getUniqueValue() !== self_id) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Unable to complete insert or update, another record with these values already exists.'));
	}

})(current, previous);
