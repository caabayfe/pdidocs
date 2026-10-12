(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('scan_check_suite');
	gr.addQuery('sys_id', '!=', current.sys_id);
	gr.addQuery('scorecard', true);
	gr.query();
	
	if (gr.next()) {
		gs.addErrorMessage(gs.getMessage('Another Scorecard Suite already exists. There can be only one.'));
		current.setAbortAction(true);
	}

})(current, previous);
