(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_atf_test_suite_result');
	gr.addQuery('parent', current.sys_id);
	gr.query();
	while (gr.next()) {
		gr.setValue('pin', current.pin);
		gr.update();
	}
	
	gr = new GlideRecord('sys_atf_test_result');
	gr.addQuery('parent', current.sys_id);
	gr.setValue('pin', current.pin);
	gr.query();
	while (gr.next()) {
		gr.setValue('pin', current.pin);
		gr.update();
	}
})(current, previous);
