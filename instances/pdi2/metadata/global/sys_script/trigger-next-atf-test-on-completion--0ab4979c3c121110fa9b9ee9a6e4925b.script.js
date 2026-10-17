(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('sys_cs_atf_queue');
	gr.addQuery('status', 'IN', ['queued', 'in_progress']);
	gr.addNotNullQuery('test');
	gr.orderBy('sys_id');
	gr.query();
	
	var executionId, testId;
	var alreadyRunning = false;
	
	while (gr.next()) {
		if (gr.getValue('status') === 'in_progress') {
			alreadyRunning = true;
			break;
		}
		executionId = gr.getUniqueValue();
		testId = gr.getValue('test');
	}
	
	if (!alreadyRunning && testId) {
		gr = new GlideRecord('sys_cs_atf_queue');
		gr.get(executionId);
		gr.setValue('status', 'in_progress');
		if (gr.update()) {
			new sn_atf.ExecuteUserTest()
				.setTestRecordSysId(testId)
				.start();	
		}
	}
})(current, previous);
