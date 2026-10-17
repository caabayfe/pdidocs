(function executeRule(current, previous /*null when async*/) {

	var gr = new GlideRecord('sys_cs_atf_queue');
	gr.addQuery('test', current.getValue('test'));
	gr.addQuery('status', 'in_progress');
	gr.query();
	while (gr.next()) {
		gr.setValue('status', 'complete');
		gr.update();
	}

})(current, previous);
